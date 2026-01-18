import Order from "../models/Order.js";

/* ======================================================
   ADMIN – GET ALL ORDERS (PAGINATED)
   GET /api/admin/orders?page=&limit=
   ====================================================== */
export const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      Order.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      orders,
      pagination: {
        page,
        limit,
        totalPages,
        totalOrders,
      },
    });
  } catch (error) {
    console.error("ADMIN PAGINATED ORDERS ERROR:", error);
    return res.status(500).json({
      orders: [],
      pagination: {
        page: 1,
        limit: 10,
        totalPages: 0,
        totalOrders: 0,
      },
    });
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
