export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, address, paymentMethod } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!address) {
      return res.status(400).json({ message: "Address required" });
    }

    const order = await Order.create({
      user: req.user.id, // ✅ WORKS FOR FIREBASE + JWT
      items,
      totalAmount,
      address,
      paymentMethod: paymentMethod || "COD",
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};
