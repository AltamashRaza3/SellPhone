import InventoryItem from "../models/InventoryItem.js";
import SellRequest from "../models/SellRequest.js";
import Product from "../models/Product.js";

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
====================================================== */
export const createInventoryFromSellRequest = async (sellRequestId) => {
  try {
    const sell = await SellRequest.findById(sellRequestId).lean();
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

    if (item.status === "Sold") {
      return res.status(409).json({
        message: "Sold items cannot be modified",
      });
    }

    if (!item.phone.images || item.phone.images.length === 0) {
      return res.status(400).json({
        message: "Upload product images before setting price",
      });
    }

    item.sellingPrice = sellingPrice;
    item.status = "Available";
    item.listedAt = new Date();
    await item.save();

    /* 🔄 Sync Product */
    let product = await Product.findOne({
      inventoryItemId: item._id,
    });

    if (product) {
      product.price = sellingPrice;
      product.images = item.phone.images;
      product.isActive = true;
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

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE PRICE ERROR:", err);
    res.status(500).json({ message: "Failed to update price" });
  }
};

/* ======================================================
   UPDATE INVENTORY STATUS (ADMIN)
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

    if (item.status === "Sold") {
      return res.status(409).json({
        message: "Sold items cannot be modified",
      });
    }

    if (status === "Available" && (!item.phone.images || item.phone.images.length === 0)) {
      return res.status(400).json({
        message: "Cannot make item available without images",
      });
    }

    item.status = status;

    if (status === "Available") {
      item.listedAt = new Date();
    }

    if (status === "Sold") {
      item.soldAt = new Date();
    }

    await item.save();

    /* 🔄 Sync Product Active State */
    await Product.updateOne(
      { inventoryItemId: item._id },
      { isActive: status === "Available" }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update status" });
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
      return res.status(409).json({
        message: "Sold items cannot be modified",
      });
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

    await Product.updateOne(
      { inventoryItemId: item._id },
      { images: imagePaths }
    );

    res.json({
      success: true,
      images: imagePaths,
    });
  } catch (err) {
    console.error("UPDATE IMAGES ERROR:", err);
    res.status(500).json({ message: "Failed to update images" });
  }
};
