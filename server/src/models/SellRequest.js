import mongoose from "mongoose";

/* ================= IMAGE SUB SCHEMA ================= */
const verificationImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" },
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
      brand: { type: String, required: true },
      model: { type: String, required: true },
      storage: { type: String, required: true },
      ram: String,
      color: String,

      declaredCondition: {
        type: String,
        enum: ["Excellent", "Good", "Fair"],
        required: true,
        default: "Good",
      },

      purchaseYear: { type: Number, required: true },

      images: {
        type: [String],
        required: true,
        validate: (v) => Array.isArray(v) && v.length >= 3,
      },
    },

    /* ================= PRICING ================= */
    pricing: {
      basePrice: { type: Number, required: true },
      finalPrice: Number,
    },

    /* ================= ADMIN ================= */
    admin: {
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      remarks: String,
      approvedAt: Date,
    },

    /* ================= RIDER ================= */
    assignedRider: {
      riderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rider",
      },
      riderName: String,
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
      totalDeduction: Number,
      finalPrice: Number,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rider",
      },
      verifiedAt: Date,
      userAccepted: { type: Boolean, default: null },

      images: {
        type: [verificationImageSchema],
        default: [],
      },
    },

    /* ================= INVOICE ================= */
    invoice: {
      number: String,
      url: String,
      generatedAt: Date,
    },

    /* ================= AUDIT ================= */
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

/* =====================================================
   🔒 PRODUCTION STATE HELPERS (NON-BREAKING)
   ===================================================== */

/**
 * Can rider verify the device?
 */
sellRequestSchema.methods.canVerify = function () {
  if (this.pickup?.status === "Completed") return false;
  if (this.verification?.finalPrice) return false; // already verified
  return ["Scheduled", "Picked"].includes(this.pickup?.status);
};

/**
 * Can rider complete the pickup?
 */
sellRequestSchema.methods.canComplete = function () {
  return (
    this.pickup?.status === "Picked" &&
    !!this.verification?.finalPrice &&
    this.verification?.userAccepted === true
  );
};

/**
 * Assertion helper for routes/controllers
 */
sellRequestSchema.methods.assert = function (condition, message) {
  if (!condition) {
    const err = new Error(message);
    err.statusCode = 400;
    throw err;
  }
};

export default mongoose.models.SellRequest ||
  mongoose.model("SellRequest", sellRequestSchema);
