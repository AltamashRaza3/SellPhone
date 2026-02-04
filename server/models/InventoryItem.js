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

    /* ================= PHONE SNAPSHOT ================= */
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
        default: [],
      },
    },

    /* ================= PROCUREMENT ================= */
    purchasePrice: {
      type: Number,
      required: true,
    },

    /* ================= INVENTORY STATE ================= */
    status: {
      type: String,
      enum: ["InStock", "Published", "Sold"],
      default: "InStock",
      index: true,
    },

    /* ================= LINKS ================= */
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    /* ================= METADATA ================= */
    publishedAt: Date,
    soldAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("InventoryItem", inventoryItemSchema);
