import express from "express";
import multer from "multer";
import adminAuth from "../middleware/adminAuth.js";
import InventoryItem from "../models/InventoryItem.js";
import Product from "../models/Product.js";

const router = express.Router();

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: "uploads/inventory",
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

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
   SET / UPDATE SELLING PRICE (AUTO LIST)
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
      return res
        .status(409)
        .json({ message: "Sold items cannot be modified" });
    }

    item.sellingPrice = sellingPrice;
    item.status = "Available";
    item.listedAt = new Date();
    await item.save();

    /* 🔄 Sync Product */
    const product = await Product.findOne({
      inventoryItemId: item._id,
    });

    if (product) {
      product.price = sellingPrice;
      await product.save();
    } else {
      await Product.create({
        inventoryItemId: item._id,
        brand: item.phone.brand,
        model: item.phone.model,
        storage: item.phone.storage,
        ram: item.phone.ram,
        color: item.phone.color,
        condition: item.phone.condition,
        price: sellingPrice,
        stock: 1,
        isActive: true,
        images: item.phone.images,
        description: "Verified refurbished phone",
      });
    }

    res.json({ message: "Price updated & listed", item });
  } catch (err) {
    console.error("PRICE UPDATE ERROR:", err);
    res.status(500).json({ message: "Failed to update price" });
  }
});

/* ======================================================
   UPDATE INVENTORY IMAGES  ✅ (FIXES YOUR 404)
====================================================== */
router.put(
  "/:id/images",
  adminAuth,
  upload.array("images", 6),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      const item = await InventoryItem.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      if (item.status === "Sold") {
        return res
          .status(409)
          .json({ message: "Sold items cannot be modified" });
      }

      const imagePaths = req.files.map(
        (f) => `/uploads/inventory/${f.filename}`,
      );

      item.phone.images = imagePaths;
      await item.save();

      /* 🔄 Sync Product Images */
      const product = await Product.findOne({
        inventoryItemId: item._id,
      });

      if (product) {
        product.images = imagePaths;
        await product.save();
      }

      res.json({ message: "Images updated", images: imagePaths });
    } catch (err) {
      console.error("IMAGE UPDATE ERROR:", err);
      res.status(500).json({ message: "Failed to update images" });
    }
  },
);

/* ======================================================
   UNLIST PRODUCT
====================================================== */
router.put("/:id/unlist", adminAuth, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    if (item.status === "Sold") {
      return res.status(409).json({ message: "Sold item cannot be unlisted" });
    }

    item.status = "Unlisted";
    await item.save();

    await Product.updateOne(
      { inventoryItemId: item._id },
      { isActive: false },
    );

    res.json({ message: "Product unlisted successfully" });
  } catch (err) {
    console.error("UNLIST ERROR:", err);
    res.status(500).json({ message: "Failed to unlist product" });
  }
});

export default router;
