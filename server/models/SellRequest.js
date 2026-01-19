import mongoose from "mongoose";

const sellRequestSchema = new mongoose.Schema(
  {
    /* ================= USER ================= */
    user: {
      uid: { type: String, required: true, index: true },
      email: { type: String, required: true },
    },

    /* ================= CONTACT ================= */
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },

    /* ================= PHONE DETAILS ================= */
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
      images: { type: [String], default: [] },
    },

    /* ================= PRICING ================= */
    expectedPrice: { type: Number, required: true },
    finalPrice: Number,

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: ["Pending", "In Review", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },

    adminNotes: String,

    /* ================= PICKUP ================= */
    pickup: {
      status: {
        type: String,
        enum: ["Not Scheduled", "Scheduled", "Picked", "Completed"],
        default: "Not Scheduled",
      },
      scheduledAt: Date,

      rider: {
        riderId: String,
        name: String,
        phone: String,
      },

      address: {
        line1: { type: String, default: "" },
        line2: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        pincode: { type: String, default: "" },
      },
    },

    /* ================= HISTORY ================= */
    history: [
      {
        action: String,
        by: String,
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.SellRequest ||
  mongoose.model("SellRequest", sellRequestSchema);
