import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    if (!req.user?.uid || !req.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid order items" });
    }

    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    if (!shippingAddress || typeof shippingAddress !== "string") {
      return res.status(400).json({ message: "Invalid shipping address" });
    }

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
    console.error("❌ CREATE ORDER ERROR MESSAGE:", error.message);
    console.error("❌ CREATE ORDER ERROR STACK:", error.stack);

    return res.status(500).json({
      message: "Order creation failed",
      error: error.message,
    });
  }
};
