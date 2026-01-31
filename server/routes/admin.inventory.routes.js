import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import adminAuth from "../middleware/adminAuth.js";
import InventoryItem from "../models/InventoryItem.js";
import Product from "../models/Product.js";

const router = express.Router();

/* ================= ENSURE UPLOAD DIR ================= */
const uploadDir = "uploads/inventory";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

/* ======================================================
   GET INVENTORY
====================================================== */
router.get("/", adminAuth, async (req, res) => {
  try {
    const items = await InventoryItem.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    console.error("GET INVENTORY ERROR:", err);
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
});

/* ======================================================
   UPDATE PRICE
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

    if (item.status === "Sold") {
      return res.status(409).json({ message: "Sold item locked" });
    }

    if (!item.phone.images.length) {
      return res
        .status(400)
        .json({ message: "Upload images before pricing" });
    }

    item.sellingPrice = sellingPrice;
    await item.save();

    /* 🔄 Sync Product Price */
    await Product.updateOne(
      { inventoryItemId: item._id },
      { price: sellingPrice }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE PRICE ERROR:", err);
    res.status(500).json({ message: "Failed to update price" });
  }
});

/* ======================================================
   UPDATE IMAGES
====================================================== */
router.put(
  "/:id/images",
  adminAuth,
  upload.array("images", 6),
  async (req, res) => {
    try {
      if (!req.files?.length) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      const item = await InventoryItem.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      if (item.status === "Sold") {
        return res.status(409).json({ message: "Sold item locked" });
      }

      const imagePaths = req.files.map(
        (f) => `/uploads/inventory/${f.filename}`
      );

      item.phone.images = imagePaths;
      await item.save();

      /* 🔄 Sync Product Images */
      await Product.updateOne(
        { inventoryItemId: item._id },
        { images: imagePaths }
      );

      res.json({ success: true, images: imagePaths });
    } catch (err) {
      console.error("UPDATE IMAGES ERROR:", err);
      res.status(500).json({ message: "Failed to update images" });
    }
  }
);

/* ======================================================
   UPDATE STATUS
====================================================== */
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Available", "Unlisted", "Sold"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    if (item.status === "Sold") {
      return res.status(409).json({ message: "Sold item locked" });
    }

    if (status === "Available" && !item.phone.images.length) {
      return res
        .status(400)
        .json({ message: "Images required before listing" });
    }

    item.status = status;
    if (status === "Available") item.listedAt = new Date();
    if (status === "Sold") item.soldAt = new Date();

    await item.save();

    /* 🔄 Sync Product Visibility */
    await Product.updateOne(
      { inventoryItemId: item._id },
      { isActive: status === "Available" }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

export default router;
