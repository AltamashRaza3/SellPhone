import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    /* ================= SOURCE ================= */
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      unique: true,
      sparse: true,
    },

    /* ================= CORE ================= */
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    name: { type: String, index: true },
    price: { type: Number, required: true, min: 0 },

    /* ================= SPECS ================= */
    storage: { type: String, required: true },
    ram: { type: String, required: true }, 
    color: { type: String, required: true },

    condition: {
      type: String,
      enum: ["Like New", "Excellent", "Good", "Fair"],
      required: true,
    },

    description: { type: String, default: "" },

    /* ================= MEDIA ================= */
    images: {
      type: [String],
      required: true,
      validate: [(v) => v.length > 0, "At least one image is required"],
    },

    /* ================= STORE STATE ================= */
    status: {
      type: String,
      enum: ["Draft", "Published","Unlisted", "Sold"],
      default: "Draft",
      index: true,
    },

    stock: { type: Number, default: 1 },

    publishedAt: Date,
    soldAt: Date,
  },
  { timestamps: true }
);

/* ================= AUTO NAME ================= */
productSchema.pre("save", function () {
  if (!this.name) {
    this.name = `${this.brand} ${this.model}`;
  }
});

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
