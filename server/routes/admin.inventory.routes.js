import express from "express";
import multer from "multer";
import fs from "fs";
import adminAuth from "../middleware/adminAuth.js";
import InventoryItem from "../models/InventoryItem.js";
import Product from "../models/Product.js";

const router = express.Router();

/* ================= UPLOAD DIR ================= */
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
   GET INVENTORY (ADMIN)
====================================================== */
router.get("/", adminAuth, async (req, res) => {
  const items = await InventoryItem.find()
    .sort({ createdAt: -1 });

  res.json(items);
});

/* ======================================================
   UPDATE INVENTORY IMAGES
====================================================== */
router.put(
  "/:id/images",
  adminAuth,
  upload.array("images", 6),
  async (req, res) => {
    if (!req.files?.length) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    if (item.status === "Sold") {
      return res.status(409).json({ message: "Sold item locked" });
    }

    const images = req.files.map(
      (f) => `/uploads/inventory/${f.filename}`
    );

    item.phone.images = images;
    await item.save();

    res.json({ success: true, images });
  }
);

/* ======================================================
   PUBLISH INVENTORY → PRODUCT  ✅ MAIN FIX
====================================================== */
router.post("/:id/publish", adminAuth, async (req, res) => {
  const { price, description } = req.body;

  if (!price || price <= 0) {
    return res.status(400).json({ message: "Valid price required" });
  }

  const item = await InventoryItem.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Inventory not found" });
  }

  if (item.status !== "InStock") {
    return res.status(409).json({ message: "Already published or sold" });
  }

  if (!item.phone.images.length) {
    return res.status(400).json({ message: "Upload images first" });
  }

  const product = await Product.create({
    inventoryItemId: item._id,
    brand: item.phone.brand,
    model: item.phone.model,
    storage: item.phone.storage,
    ram: item.phone.ram,
    color: item.phone.color,
    condition: item.phone.condition,
    price,
    images: item.phone.images,
    description,
    status: "Published",
    publishedAt: new Date(),
  });

  item.status = "Published";
  item.productId = product._id;
  item.publishedAt = new Date();
  await item.save();

  res.json({
    success: true,
    product,
  });
});

/* ======================================================
   MARK SOLD (SYNC)
====================================================== */
router.post("/:id/sold", adminAuth, async (req, res) => {
  const item = await InventoryItem.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Inventory not found" });
  }

  item.status = "Sold";
  item.soldAt = new Date();
  await item.save();

  await Product.updateOne(
    { inventoryItemId: item._id },
    { status: "Sold", soldAt: new Date() }
  );

  res.json({ success: true });
});

export default router;
