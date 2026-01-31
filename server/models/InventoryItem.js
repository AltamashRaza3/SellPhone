import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    /* ================= SOURCE ================= */
    sellRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellRequest",
      required: true,
      unique: true,
      index: true,
    },

    /* ================= PHONE ================= */
    phone: {
      brand: { type: String, required: true },
      model: { type: String, required: true },
      storage: String,
      ram: String,
      color: String,

      condition: {
        type: String,
        enum: ["Excellent", "Good", "Fair"],
        required: true,
      },

      images: {
        type: [String],
        required: true,
        validate: {
          validator: (arr) => Array.isArray(arr) && arr.length > 0,
          message: "At least one product image is required",
        },
      },
    },

    /* ================= PRICING ================= */
    purchasePrice: {
      type: Number,
      required: true,
    },

    sellingPrice: {
      type: Number,
    },

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: ["Draft", "Available", "Unlisted", "Sold"],
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
