import Order from "../models/Order.js";
import InventoryItem from "../models/InventoryItem.js";

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

    if (!items?.length || !totalAmount || !shippingAddress) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    /* 🔒 OPTIONAL SAFETY CHECK (recommended) */
    for (const item of items) {
      if (item.inventoryId) {
        const inventory = await InventoryItem.findById(item.inventoryId);
        if (!inventory || inventory.status !== "Available") {
          return res.status(400).json({
            message: "One or more items are no longer available",
          });
        }
      }
    }

    const order = await Order.create({
      user: {
        uid: user.uid,
        email: user.email,
      },
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      status: "Pending",
      statusHistory: [
        {
          status: "Pending",
          changedBy: "user",
        },
      ],
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error("❌ CREATE ORDER ERROR:", error);
    return res.status(500).json({ message: "Order creation failed" });
  }
};

/* ======================================================
   GET USER ORDERS
   GET /api/orders/my
====================================================== */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "user.uid": req.user.uid })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(orders);
  } catch (error) {
    console.error("❌ GET USER ORDERS ERROR:", error);
    return res.status(500).json([]);
  }
};

/* ======================================================
   GET SINGLE ORDER (USER SAFE + ADMIN)
   GET /api/orders/:id
====================================================== */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      req.user.role !== "admin" &&
      order.user.uid !== req.user.uid
    ) {
      return res.status(403).json({ message: "Access denied" });
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

    order.status = "Cancelled";
    order.statusHistory.push({
      status: "Cancelled",
      changedBy: "user",
    });

    await order.save();

    return res.json({ message: "Order cancelled", order });
  } catch (error) {
    console.error("❌ CANCEL ORDER ERROR:", error);
    return res.status(500).json({ message: "Failed to cancel order" });
  }
};

/* ======================================================
   ADMIN – GET ALL ORDERS
   GET /api/admin/orders
====================================================== */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(orders);
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

    /* 🔥 INVENTORY AUTO-SYNC ON DELIVERY */
    if (status === "Delivered") {
      order.deliveredAt = new Date();

      for (const item of order.items) {
        if (item.inventoryId) {
          await InventoryItem.findByIdAndUpdate(item.inventoryId, {
            status: "Sold",
            soldAt: new Date(),
          });
        }
      }
    }

    order.statusHistory.push({
      status,
      changedBy: "admin",
    });

    await order.save();

    return res.json({ message: "Order updated", order });
  } catch (error) {
    console.error("❌ UPDATE ORDER ERROR:", error);
    return res.status(500).json({ message: "Failed to update order" });
  }
};
