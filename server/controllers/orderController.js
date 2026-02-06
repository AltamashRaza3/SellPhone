import Order from "../models/Order.js";
import InventoryItem from "../models/InventoryItem.js";
import { generateOrderInvoice } from "../utils/generateOrderInvoice.js";

/* ======================================================
   STATUS TRANSITIONS (BACKEND AUTHORITY)
====================================================== */
const STATUS_TRANSITIONS = {
  Pending: ["Processing"],
  Processing: ["Shipped"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

/* ======================================================
   CREATE ORDER (USER)
   POST /api/orders
====================================================== */
export const createOrder = async (req, res) => {
  try {
    const user = req.user;
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

    const uid = user?.uid || user?.id;

    if (!uid || !user?.email) {
      return res.status(401).json({ message: "Invalid user session" });
    }

    /* ================= SHIPPING ADDRESS FIX ================= */
    const normalizedAddress = {
      name: shippingAddress?.name,
      phone: shippingAddress?.phone,
      line1: shippingAddress?.line1,
      line2: shippingAddress?.line2 || "",
      city: shippingAddress?.city,
      state: shippingAddress?.state,
      pincode: shippingAddress?.pincode,
    };

    for (const [key, value] of Object.entries(normalizedAddress)) {
      if (!value && key !== "line2") {
        return res.status(400).json({
          message: `Missing shipping address field: ${key}`,
        });
      }
    }

    /* ================= ITEMS FIX ================= */
    if (!items?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const normalizedItems = items.map((item, index) => {
      const productId = item.productId || item._id;
      const price = item.price;

      if (!productId || price == null) {
        throw new Error(`Invalid cart item at index ${index}`);
      }

      return {
        productId,
        inventoryId: item.inventoryId || null,
        price,
        quantity: item.quantity || 1,
      };
    });

    /* ================= CREATE ORDER ================= */
    const order = await Order.create({
      user: {
        uid,
        email: user.email,
      },
      items: normalizedItems,
      totalAmount,
      shippingAddress: normalizedAddress,
      paymentMethod: paymentMethod || "COD",
      status: "Pending",
      statusHistory: [{ status: "Pending", changedBy: "user" }],
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error("❌ CREATE ORDER ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};



/* ======================================================
   GET USER ORDERS (SAFE)
   GET /api/orders/my
====================================================== */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "user.uid": req.user.uid })
      .sort({ createdAt: -1 })
      .lean();

    const safeOrders = orders.map((order) => {
      if (order.status !== "Delivered") {
        delete order.invoiceUrl;
        delete order.invoiceNumber;
        delete order.invoiceGenerated;
      }
      return order;
    });

    return res.status(200).json(safeOrders);
  } catch (error) {
    console.error("❌ GET USER ORDERS ERROR:", error);
    return res.status(500).json([]);
  }
};

/* ======================================================
   GET SINGLE ORDER (USER + ADMIN SAFE)
   GET /api/orders/:id
====================================================== */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role !== "admin" && order.user.uid !== req.user.uid) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🔒 Hide invoice until delivered
    if (order.status !== "Delivered") {
      delete order.invoiceUrl;
      delete order.invoiceNumber;
      delete order.invoiceGenerated;
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("❌ GET ORDER ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
};

/* ======================================================
   USER – CANCEL ORDER
   PUT /api/orders/:id/cancel
====================================================== */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.uid !== req.user.uid) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (order.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });
    }

    await Order.updateOne(
      { _id: order._id },
      {
        $set: { status: "Cancelled" },
        $push: {
          statusHistory: {
            status: "Cancelled",
            changedBy: "user",
            changedAt: new Date(),
          },
        },
      }
    );

    return res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("❌ CANCEL ORDER ERROR:", error);
    return res.status(500).json({ message: "Failed to cancel order" });
  }
};

/* ======================================================
   ADMIN – GET ALL ORDERS (SAFE)
   GET /api/admin/orders
====================================================== */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

    const safeOrders = orders.map((order) => {
      if (order.status !== "Delivered") {
        delete order.invoiceUrl;
        delete order.invoiceNumber;
        delete order.invoiceGenerated;
      }
      return order;
    });

    return res.status(200).json(safeOrders);
  } catch (error) {
    console.error("❌ ADMIN GET ORDERS ERROR:", error);
    return res.status(500).json([]);
  }
};

/* ======================================================
   ADMIN – UPDATE ORDER STATUS
   PUT /api/admin/orders/:id
====================================================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["Cancelled", "Delivered"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "This order can no longer be updated" });
    }

    const allowed = STATUS_TRANSITIONS[order.status] || [];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid transition: ${order.status} → ${status}`,
      });
    }

    order.status = status;

    if (status === "Processing") order.processedAt = new Date();
    if (status === "Shipped") order.shippedAt = new Date();

    /* ================= DELIVERY ================= */
    if (status === "Delivered") {
      order.deliveredAt = new Date();

      // Inventory sync
      for (const item of order.items) {
        if (item.inventoryId) {
          await InventoryItem.findByIdAndUpdate(item.inventoryId, {
            status: "Sold",
            soldAt: new Date(),
          });
        }
      }

      // Invoice generation (ONLY HERE)
      if (!order.invoiceGenerated) {
        const invoice = await generateOrderInvoice(order);
        order.invoiceGenerated = true;
        order.invoiceNumber = invoice.number;
        order.invoiceUrl = invoice.url;
      }
    }

    order.statusHistory.push({
      status,
      changedBy: "admin",
      changedAt: new Date(),
    });

    await order.save();

    return res.json({ message: "Order updated", order });
  } catch (error) {
    console.error("❌ UPDATE ORDER ERROR:", error);
    return res.status(500).json({ message: "Failed to update order" });
  }
};
