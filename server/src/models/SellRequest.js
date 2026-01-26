import mongoose from "mongoose";

/* ================= IMAGE SUB SCHEMA ================= */
const verificationImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: String, required: true },
  },
  { _id: false }
);

/* ================= MAIN SCHEMA ================= */
const sellRequestSchema = new mongoose.Schema(
  {
    /* USER */
    user: {
      uid: { type: String, required: true, index: true },
      email: { type: String, required: true },
    },

    contact: {
      phone: { type: String, required: true },
      email: String,
    },

    /* PHONE (USER DECLARATION) */
    phone: {
      brand: { type: String, required: true },
      model: { type: String, required: true },
      storage: { type: String, required: true },
      ram: String,
      color: String,
      declaredCondition: {
        type: String,
        enum: ["Excellent", "Good", "Fair"],
        required: true,
      },
      purchaseYear: { type: Number, required: true },
      images: {
        type: [String],
        required: true,
        validate: (v) => v.length >= 3,
      },
    },

    /* PRICING (SYSTEM) */
    pricing: {
      basePrice: { type: Number, required: true },
    },

    /* ADMIN */
    admin: {
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      remarks: String,
      approvedAt: Date,
    },

    /* RIDER */
    assignedRider: {
      riderId: String,
      riderName: String,
      assignedAt: Date,
    },

    /* PICKUP */
    pickup: {
      status: {
        type: String,
        enum: ["NotScheduled", "Scheduled", "Picked", "Completed", "Rejected"],
        default: "NotScheduled",
      },
      scheduledAt: Date,
      completedAt: Date,
      address: {
        line1: String,
        city: String,
        state: String,
        pincode: String,
      },
    },

    /* VERIFICATION */
    verification: {
      checks: { type: Object, default: {} },
      deductions: [{ reason: String, amount: Number }],
      totalDeduction: Number,
      finalPrice: Number,
      verifiedBy: String,
      verifiedAt: Date,
      userAccepted: { type: Boolean, default: null },
      images: { type: [verificationImageSchema], default: [] },
    },

    /* AUDIT */
    statusHistory: [
      {
        status: String,
        changedBy: { type: String, enum: ["user", "admin", "rider", "system"] },
        note: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.SellRequest ||
  mongoose.model("SellRequest", sellRequestSchema);
