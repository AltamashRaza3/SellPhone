import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    /* ================= SOURCE ================= */
    sellRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellRequest",
      required: true,
      unique: true, // one inventory per pickup
    },

    /* ================= PHONE ================= */
    phone: {
      brand: String,
      model: String,
      storage: String,
      ram: String,
      color: String,
      condition: String,
      images: [String], // ✅ REQUIRED for listing
    },

    /* ================= PRICING ================= */
    purchasePrice: {
      type: Number, // finalPrice paid to seller
      required: true,
    },

    sellingPrice: {
      type: Number, // admin sets later
    },

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: ["Draft", "Available", "Sold"],
      default: "Draft",
      index: true,
    },

    /* ================= METADATA ================= */
    listedAt: Date,
    soldAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.InventoryItem ||
  mongoose.model("InventoryItem", inventoryItemSchema);
