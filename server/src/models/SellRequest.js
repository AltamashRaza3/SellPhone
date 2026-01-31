import mongoose from "mongoose";

/* ================= IMAGE SUB SCHEMA ================= */
const verificationImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: String }, // riderId (string)
  },
  { _id: false }
);

/* ================= MAIN SCHEMA ================= */
const sellRequestSchema = new mongoose.Schema(
  {
    /* ================= USER ================= */
    user: {
      uid: { type: String, required: true, index: true },
      email: { type: String, required: true },
    },

    contact: {
      phone: { type: String, required: true },
      email: String,
    },

    /* ================= PHONE ================= */
    phone: {
      brand: String,
      model: String,
      storage: String,
      ram: String,
      color: String,
      declaredCondition: String,
      purchaseYear: Number,
      images: [String],
    },

    /* ================= PRICING ================= */
    pricing: {
      basePrice: Number, // 🔒 base only
    },
    admin: {
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    remarks: String,
    approvedAt: Date,
},

    /* ================= ASSIGNED RIDER ================= */
    assignedRider: {
      riderId: { type: String, index: true }, // 🔥 STRING (critical)
      riderName: String,
      riderPhone: String,
      assignedAt: Date,
    },

    /* ================= PICKUP ================= */
    pickup: {
      status: {
        type: String,
        enum: ["Pending", "Scheduled", "Picked", "Completed", "Rejected"],
        default: "Pending",
        index: true,
      },
      scheduledAt: Date,
      completedAt: Date,
      rejectedReason: String,
      address: {
        line1: String,
        city: String,
        state: String,
        pincode: String,
      },
    },

    /* ================= VERIFICATION ================= */
    verification: {
      checks: { type: Object, default: {} },
      deductions: [{ reason: String, amount: Number }],
      finalPrice: Number,
      verifiedBy: String, // riderId
      verifiedAt: Date,
      userAccepted: { type: Boolean, default: null },
      images: { type: [verificationImageSchema], default: [] },
    },

      /* ================= RIDER PAYOUT (🔥 CRITICAL) ================= */
    riderPayout: {
      amount: { type: Number, default: 0 },
      calculatedAt: Date,
    },
    
    /* ================= STATUS HISTORY ================= */
    statusHistory: [
      {
        status: String,
        changedBy: {
          type: String,
          enum: ["user", "admin", "rider", "system"],
        },
        note: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

/* ================= HELPERS ================= */
sellRequestSchema.methods.canVerify = function () {
  return (
    ["Scheduled", "Picked"].includes(this.pickup.status) &&
    !this.verification.finalPrice
  );
};

sellRequestSchema.methods.canComplete = function () {
  return (
    this.pickup.status === "Picked" &&
    !!this.verification.finalPrice &&
    this.verification.userAccepted === true
  );
};

export default mongoose.model("SellRequest", sellRequestSchema);
