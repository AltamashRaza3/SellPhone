import InventoryItem from "../models/InventoryItem.js";
import SellRequest from "../models/SellRequest.js";
import Product from "../models/Product.js";

/* ======================================================
   GET INVENTORY (ADMIN)
====================================================== */
export const getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find()
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error("GET INVENTORY ERROR:", err);
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
};

/* ======================================================
   AUTO CREATE INVENTORY FROM SELL REQUEST (SYSTEM)
====================================================== */
export const createInventoryFromSellRequest = async (sellRequestId) => {
  try {
    const sell = await SellRequest.findById(sellRequestId);
    if (!sell) return;

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
        images: [],
      },

      purchasePrice: sell.verification.finalPrice,
      status: "InStock",
    });
  } catch (err) {
    console.error("CREATE INVENTORY ERROR:", err);
  }
};

/* ======================================================
   UPDATE INVENTORY IMAGES (ADMIN)
====================================================== */
export const updateInventoryImages = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    if (item.status === "Sold") {
      return res.status(409).json({ message: "Sold items locked" });
    }

    if (!req.files?.length) {
      return res.status(400).json({ message: "Images required" });
    }

    const images = req.files.map(
      (file) => `/uploads/inventory/${file.filename}`
    );

    item.phone.images = images;
    await item.save();

    res.json({ success: true, images });
  } catch (err) {
    console.error("UPDATE IMAGES ERROR:", err);
    res.status(500).json({ message: "Failed to update images" });
  }
};

/* ======================================================
   PUBLISH INVENTORY → PRODUCT (ADMIN)
====================================================== */
export const publishInventoryItem = async (req, res) => {
  try {
    const { price, description } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({ message: "Valid price required" });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    if (!item.phone.images || item.phone.images.length === 0) {
      return res.status(400).json({ message: "Inventory has no images" });
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

    res.json({ success: true, product });
  } catch (err) {
    console.error("PUBLISH INVENTORY ERROR:", err);
    res.status(500).json({ message: "Failed to publish inventory item" });
  }
};

/* ======================================================
   MARK INVENTORY AS SOLD (SYNC)
====================================================== */
export const markInventorySold = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    item.status = "Sold";
    item.soldAt = new Date();
    await item.save();

    await Product.updateOne(
      { inventoryItemId: item._id },
      { status: "Sold", soldAt: new Date() }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("MARK SOLD ERROR:", err);
    res.status(500).json({ message: "Failed to mark item sold" });
  }
};
