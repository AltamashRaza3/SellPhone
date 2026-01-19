import mongoose from "mongoose";

const sellRequestSchema = new mongoose.Schema(
  {
    /* ================= USER ================= */
    user: {
      uid: {
        type: String,
        required: true,
        index: true,
      },
      email: {
        type: String,
        required: true,
      },
    },

    /* ================= CONTACT ================= */
    contact: {
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
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
      images: {
        type: [String],
        default: [],
      },
    },

    /* ================= PRICE ================= */
    expectedPrice: {
      type: Number,
      required: true,
    },

    /* ================= SELL STATUS ================= */
    status: {
      type: String,
      enum: ["Pending", "In Review", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },

    /* ================= VERIFICATION (PHASE 20.3) ================= */
    verification: {
      verifiedBy: {
        type: String, // admin _id
      },
      verifiedAt: {
        type: Date,
      },
      remarks: {
        type: String,
      },
    },

    /* ================= PICKUP & LOGISTICS ================= */
    pickup: {
      status: {
        type: String,
        enum: ["Not Scheduled", "Scheduled", "Picked", "Completed"],
        default: "Not Scheduled",
        index: true,
      },

      scheduledAt: Date,

      rider: {
        name: String,
        phone: String,
      },

      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        pincode: String,
      },
    },

    /* ================= HISTORY ================= */
    statusHistory: [
      {
        status: String,
        changedBy: String, // user uid OR admin id
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

/* ================= SAFE EXPORT ================= */
export default mongoose.models.SellRequest ||
  mongoose.model("SellRequest", sellRequestSchema);
