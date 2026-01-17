import Order from "../models/Order.js";

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
   GET LOGGED-IN USER ORDERS
   GET /api/orders/my
   ====================================================== */
export const getUserOrders = async (req, res) => {
  try {
    const user = req.user;

    const orders = await Order.find({ "user.uid": user.uid })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(Array.isArray(orders) ? orders : []);
  } catch (error) {
    console.error("❌ GET USER ORDERS ERROR:", error);
    return res.status(500).json([]);
  }
};

/* ======================================================
   GET SINGLE ORDER (USER)
   GET /api/orders/:id
   ====================================================== */
export const getOrderById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // User can access ONLY their own order
    if (order.user?.uid !== user.uid) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("❌ GET ORDER BY ID ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
};

/* ======================================================
   USER – CANCEL ORDER (ONLY IF PENDING)
   PUT /api/orders/:id/cancel
   ====================================================== */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ownership check
    if (order.user?.uid !== user.uid) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Business rule
    if (order.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending orders can be cancelled",
      });
    }

    order.status = "Cancelled";

    order.statusHistory.push({
      status: "Cancelled",
      changedBy: "user",
    });

    await order.save();

    return res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("❌ CANCEL ORDER ERROR:", error);
    return res.status(500).json({
      message: "Failed to cancel order",
    });
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

    return res.status(200).json(Array.isArray(orders) ? orders : []);
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

    // 🔒 Cancelled orders are immutable
    if (order.status === "Cancelled") {
      return res.status(400).json({
        message: "Cancelled orders cannot be updated",
      });
    }

    const currentStatus = order.status;

    const allowedTransitions = {
      Pending: ["Processing"],
      Processing: ["Shipped"],
      Shipped: ["Delivered"],
    };

    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition: ${currentStatus} → ${status}`,
      });
    }

    order.status = status;

    if (status === "Processing") order.processedAt = new Date();
    if (status === "Shipped") order.shippedAt = new Date();
    if (status === "Delivered") order.deliveredAt = new Date();

    order.statusHistory.push({
      status,
      changedBy: "admin",
    });

    await order.save();

    return res.status(200).json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("❌ UPDATE ORDER STATUS ERROR:", error);
    return res.status(500).json({
      message: "Failed to update order status",
    });
  }
};
