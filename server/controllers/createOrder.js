export const createOrder = async (req, res) => {
  try {
    const user = req.user;

    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

    if (!items?.length || !totalAmount) {
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
      paymentMethod,
      status: "Pending",
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error("❌ CREATE ORDER ERROR:", error);
    return res.status(500).json({ message: "Order creation failed" });
  }
};
