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

      storage: {
        type: String,
        required: true,
      },

      ram: {
        type: String,
        required: true,
      },

      color: {
        type: String,
        required: true, 
        trim: true,
      },

      condition: {
        type: String,
        enum: ["Like New", "Excellent", "Good", "Fair"],
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
      min: 0,
    },
    sellingPrice: {
    type: Number,
    min: 0,
    },

    /* ================= INVENTORY STATE ================= */
    status: {
      type: String,
      enum: ["InStock", "Published","Unlisted", "Sold"],
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
