import mongoose from "mongoose";

/* ================= IMAGE SUB SCHEMA ================= */
const verificationImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: String },
  },
  { _id: false }
);

/* ================= MAIN SCHEMA ================= */
const sellRequestSchema = new mongoose.Schema(
  {
    /* ================= MASTER WORKFLOW STATUS ================= */
    workflowStatus: {
      type: String,
      enum: [
        "CREATED",
        "ADMIN_APPROVED",
        "ASSIGNED_TO_RIDER",
        "UNDER_VERIFICATION",
        "REJECTED_BY_RIDER",
        "ESCALATED",
        "USER_ACCEPTED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "CREATED",
      index: true,
    },

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
      basePrice: Number,
    },

    /* ================= ADMIN ================= */
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
      riderId: { type: String, index: true },
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
      verifiedBy: String,
      verifiedAt: Date,
      userAccepted: { type: Boolean, default: null },
      images: { type: [verificationImageSchema], default: [] },
    },

    /* ================= RIDER PAYOUT ================= */
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

/* ===========================================================
   SAFE STATUS TRANSITION METHOD (MANDATORY FOR PRODUCTION)
   =========================================================== */
sellRequestSchema.methods.transitionStatus = function (
  newStatus,
  changedBy = "system",
  note = ""
) {
  const validTransitions = {
    CREATED: ["ADMIN_APPROVED", "CANCELLED"],
    ADMIN_APPROVED: ["ASSIGNED_TO_RIDER", "CANCELLED"],
    ASSIGNED_TO_RIDER: ["UNDER_VERIFICATION", "CANCELLED"],
    UNDER_VERIFICATION: ["REJECTED_BY_RIDER", "USER_ACCEPTED"],
    REJECTED_BY_RIDER: ["ESCALATED"],
    ESCALATED: ["USER_ACCEPTED", "CANCELLED"],
    USER_ACCEPTED: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
  };

  const allowedNext = validTransitions[this.workflowStatus] || [];

  if (!allowedNext.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${this.workflowStatus} to ${newStatus}`
    );
  }

  this.workflowStatus = newStatus;

  this.statusHistory.push({
    status: newStatus,
    changedBy,
    note,
  });
};

/* ================= HELPERS ================= */

sellRequestSchema.methods.canVerify = function () {
  return this.workflowStatus === "UNDER_VERIFICATION";
};

sellRequestSchema.methods.canComplete = function () {
  return this.workflowStatus === "USER_ACCEPTED";
};

export default mongoose.model("SellRequest", sellRequestSchema);
