import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    storage: { type: String, required: true },
    condition: { type: String, required: true },
    color: { type: String },
    ram: { type: String },
    description: { type: String },
    image: { type: String }, // URL for now
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
