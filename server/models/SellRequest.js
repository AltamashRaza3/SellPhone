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
  enum: [
    "Pending",
    "In Review",
    "Pickup Scheduled",
    "Picked",
    "Completed",
    "Cancelled",
  ],
  default: "Pending",
},

    adminNotes: String,

    /* ================= PICKUP (LOGISTICS ONLY) ================= */
    pickup: {
      status: {
        type: String,
        enum: ["Not Scheduled", "Scheduled", "Picked", "Completed"],
        default: "Not Scheduled",
        index: true,
      },
      scheduledAt: Date,
      address: {
        line1: { type: String, default: "" },
        line2: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        pincode: { type: String, default: "" },
      },
    },

    /* ================= RIDER ASSIGNMENT ================= */
    assignedRider: {
      riderId: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" },
      name: String,
      phone: String,
    },

    /* ================= VERIFICATION ================= */
    verification: {
      actualCondition: String,
      finalPrice: Number,
      riderNotes: String,
      images: {
        type: [String],
        default: [],
      },
      verifiedAt: Date,
    },

    /* ================= HISTORY ================= */
    history: {
      type: [
        {
          action: String,
          by: String,
          note: String,
          at: { type: Date, default: Date.now },
        },
      ],
      default: [], 
    },
  },
  { timestamps: true }
);

export default mongoose.models.SellRequest ||
  mongoose.model("SellRequest", sellRequestSchema);
