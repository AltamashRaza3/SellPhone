import Order from "../models/Order.js";

/* ======================================================
   GET ALL ORDERS (ADMIN)
   GET /api/admin/orders
   ====================================================== */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean(); // 🔑 prevents mongoose crash

    // Always return array (frontend safety)
    return res.status(200).json(Array.isArray(orders) ? orders : []);
  } catch (error) {
    console.error("❌ ADMIN GET ORDERS ERROR:", error);
    return res.status(500).json([]); // NEVER break frontend
  }
};

/* ======================================================
   GET SINGLE ORDER (ADMIN)
   GET /api/admin/orders/:id
   ====================================================== */
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: "Invalid order ID" });
  }
};

/* ======================================================
   UPDATE ORDER STATUS (ADMIN)
   PUT /api/admin/orders/:id
   ====================================================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;

    if (status === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order" });
  }
};
