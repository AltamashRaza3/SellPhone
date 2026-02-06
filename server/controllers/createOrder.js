import Order from "../models/Order.js";

/* ======================================================
   CREATE ORDER (USER)
   POST /api/orders
====================================================== */
export const createOrder = async (req, res) => {
  try {
    /* ================= AUTH ================= */
    if (!req.user || !req.user.uid || !req.user.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

    /* ================= VALIDATION ================= */
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid order items" });
    }

    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    if (!shippingAddress || typeof shippingAddress !== "string") {
      return res.status(400).json({ message: "Invalid shipping address" });
    }

    /* ================= CREATE ================= */
    const order = await Order.create({
      user: {
        uid: req.user.uid,
        email: req.user.email,
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
