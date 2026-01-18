import mongoose from "mongoose";

const sellRequestSchema = new mongoose.Schema(
  {
    user: {
      uid: { type: String, required: true, index: true },
      email: { type: String, required: true },
    },

    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true }, // WhatsApp number
    },

    pickupAddress: {
      fullAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: String,
    },

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

    expectedPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "In Review", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },

    adminNotes: String,

    statusHistory: [
      {
        status: String,
        changedBy: String,
        note: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.SellRequest ||
  mongoose.model("SellRequest", sellRequestSchema);
