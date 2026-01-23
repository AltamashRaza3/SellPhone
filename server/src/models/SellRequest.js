import mongoose from "mongoose";

const sellRequestSchema = new mongoose.Schema(
  {
    user: {
      uid: String,
      email: String,
    },

    contact: {
      phone: String,
      email: String,
    },

    phone: {
      brand: String,
      model: String,
      storage: String,
      color: String,
      condition: String,
    },

    expectedPrice: Number,
    finalPrice: Number,

    status: {
      type: String,
      enum: [
        "Pending",
        "Pickup Scheduled",
        "Picked",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    pickup: {
      status: {
        type: String,
        enum: ["Not Scheduled", "Scheduled", "Picked", "Completed"],
        default: "Not Scheduled",
      },
      scheduledAt: Date,
      address: {
        line1: String,
        city: String,
        state: String,
        pincode: String,
      },
    },

    assignedRider: {
      riderId: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" },
      name: String,
      phone: String,
    },

    verification: {
      checks: Object,
      deductions: Array,
      finalPrice: Number,
      images: [String],
      riderNotes: String,
      verifiedAt: Date,
    },

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

export default mongoose.model("SellRequest", sellRequestSchema);
