import InventoryItem from "../models/InventoryItem.js";
import SellRequest from "../models/SellRequest.js";

/* ======================================================
   GET INVENTORY (ADMIN)
====================================================== */
export const getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    console.error("GET INVENTORY ERROR:", err);
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
};

/* ======================================================
   AUTO CREATE INVENTORY FROM SELL REQUEST (SYSTEM)
   - Called after pickup is completed
====================================================== */
export const createInventoryFromSellRequest = async (sellRequestId) => {
  try {
    const sell = await SellRequest.findById(sellRequestId).lean();
    if (!sell) return;

    // Prevent duplicates
    const exists = await InventoryItem.findOne({
      sellRequestId: sell._id,
    });
    if (exists) return;

    await InventoryItem.create({
      sellRequestId: sell._id,

      phone: {
        brand: sell.phone.brand,
        model: sell.phone.model,
        storage: sell.phone.storage,
        ram: sell.phone.ram,
        color: sell.phone.color,
        condition: sell.phone.declaredCondition,
        images: sell.phone.images || [],
      },

      purchasePrice: sell.verification.finalPrice,
      status: "Draft",
    });
  } catch (err) {
    console.error("CREATE INVENTORY ERROR:", err);
  }
};

/* ======================================================
   UPDATE SELLING PRICE (ADMIN)
====================================================== */
export const updateInventoryPrice = async (req, res) => {
  try {
    const { sellingPrice } = req.body;

    if (!sellingPrice || sellingPrice <= 0) {
      return res.status(400).json({ message: "Invalid selling price" });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    item.sellingPrice = sellingPrice;
    await item.save();

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE PRICE ERROR:", err);
    res.status(500).json({ message: "Failed to update price" });
  }
};

/* ======================================================
   UPDATE INVENTORY STATUS (ADMIN)
   - Available / Unlisted / Sold
====================================================== */
export const updateInventoryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Available", "Unlisted", "Sold"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    item.status = status;

    if (status === "Available") {
      item.listedAt = new Date();
    }

    if (status === "Sold") {
      item.soldAt = new Date();
    }

    await item.save();
    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/* ======================================================
   UPDATE INVENTORY IMAGES (ADMIN)
   - Replaces existing images
====================================================== */
export const updateInventoryImages = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one image is required",
      });
    }

    const imagePaths = req.files.map(
      (file) => `/uploads/inventory/${file.filename}`
    );

    item.phone.images = imagePaths;
    await item.save();

    res.json({
      success: true,
      images: imagePaths,
    });
  } catch (err) {
    console.error("UPDATE IMAGES ERROR:", err);
    res.status(500).json({ message: "Failed to update images" });
  }
};
