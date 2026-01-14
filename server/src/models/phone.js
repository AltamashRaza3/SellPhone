import mongoose from "mongoose";

const phoneSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    price: { type: Number, required: true },
    storage: { type: String },
    condition: { type: String },
    color: { type: String },
    ram: { type: String },
    image: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Phone", phoneSchema);
