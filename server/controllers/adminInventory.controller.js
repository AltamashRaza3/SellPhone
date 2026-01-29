import InventoryItem from "../models/InventoryItem.js";
import SellRequest from "../models/SellRequest.js";

/* ======================================================
   GET ALL INVENTORY
====================================================== */
export const getInventory = async (req, res) => {
  const items = await InventoryItem.find()
    .sort({ createdAt: -1 })
    .lean();

  res.json(items);
};

/* ======================================================
   CREATE INVENTORY (AUTO FROM PICKUP)
====================================================== */
export const createInventoryFromSellRequest = async (sellRequestId) => {
  const sell = await SellRequest.findById(sellRequestId).lean();
  if (!sell) return;

  await InventoryItem.create({
    sellRequestId: sell._id,
    phone: {
      brand: sell.phone.brand,
      model: sell.phone.model,
      storage: sell.phone.storage,
      ram: sell.phone.ram,
      color: sell.phone.color,
      condition: sell.phone.declaredCondition,
    },
    purchasePrice: sell.pricing.finalPrice,
    status: "Draft",
  });
};

/* ======================================================
   UPDATE INVENTORY (ADMIN)
====================================================== */
export const updateInventory = async (req, res) => {
  const { sellingPrice, status } = req.body;

  const item = await InventoryItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  if (sellingPrice !== undefined) item.sellingPrice = sellingPrice;

  if (status === "Available") {
    item.status = "Available";
    item.listedAt = new Date();
  }

  await item.save();
  res.json(item);
};
