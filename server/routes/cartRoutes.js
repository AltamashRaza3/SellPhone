import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();

/* ================= GET CART ================= */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId }).populate("items.phoneId");

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json({ items: cart.items || [] });
  } catch (err) {
    console.error("GET CART ERROR:", err);
    res.status(500).json({ message: "Failed to load cart" });
  }
});

/* ================= SAVE / UPDATE CART ================= */
router.post("/", async (req, res) => {
  try {
    const { userId, items } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items },
      { upsert: true, new: true }
    );

    res.json(cart);
  } catch (err) {
    console.error("SAVE CART ERROR:", err);
    res.status(500).json({ message: "Failed to save cart" });
  }
});

/* ================= CLEAR CART ================= */
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await Cart.findOneAndDelete({ userId });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE CART ERROR:", err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

export default router;
