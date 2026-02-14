import mongoose from "mongoose";

const adminAlertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "AUTO_REJECT",
        "RIDER_REJECT",
        "VERIFICATION_ERROR",
        "FRAUD_FLAG",
      ],
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    sellRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellRequest",
      required: true,
      index: true,
    },

    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
    },

    message: {
      type: String,
      required: true,
    },

    metadata: {
      type: Object, // flexible for future (price, deductions, etc.)
      default: {},
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AdminAlert", adminAlertSchema);
