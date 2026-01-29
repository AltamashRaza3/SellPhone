import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import InventoryItem from "../models/InventoryItem.js";
import Product from "../models/Product.js";

const router = express.Router();

/* ======================================================
   GET INVENTORY (ADMIN)
====================================================== */
router.get("/", adminAuth, async (req, res) => {
  try {
    const items = await InventoryItem.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    console.error("INVENTORY FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to load inventory" });
  }
});

/* ======================================================
   SET SELLING PRICE + AUTO LIST PRODUCT (FINAL)
   PUT /api/admin/inventory/:id/price
====================================================== */
router.put("/:id/price", adminAuth, async (req, res) => {
  try {
    const { sellingPrice } = req.body;

    if (!sellingPrice || sellingPrice <= 0) {
      return res.status(400).json({ message: "Invalid selling price" });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    /* 🔒 SOLD ITEMS ARE LOCKED */
    if (item.status === "Sold") {
      return res
        .status(409)
        .json({ message: "Sold items cannot be modified" });
    }

    /* ================= UPDATE INVENTORY ================= */
    item.sellingPrice = sellingPrice;
    item.status = "Available";
    item.listedAt = new Date();
    await item.save();

    /* ================= AUTO CREATE PRODUCT ================= */
    const existingProduct = await Product.findOne({
      inventoryItemId: item._id,
    });

    if (!existingProduct) {
      await Product.create({
        inventoryItemId: item._id, // 🔒 HARD LINK
        brand: item.phone.brand,
        model: item.phone.model,
        storage: item.phone.storage,
        ram: item.phone.ram,
        color: item.phone.color,
        condition: item.phone.condition,
        price: sellingPrice,
        stock: 1, // 🔥 one phone = one stock
        isActive: true,
        images: [],
        description: "Verified refurbished phone",
      });
    }

    res.json({
      message: "Inventory listed & product auto-created",
      item,
    });
  } catch (err) {
    console.error("AUTO LIST ERROR:", err);
    res.status(500).json({ message: "Failed to list inventory item" });
  }
});

export default router;
