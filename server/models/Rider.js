// models/Rider.js
import mongoose from "mongoose";

const riderSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    /* OTP (temporary) */
    otp: String,
    otpExpiresAt: Date,

    /* Audit */
    lastLoginAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Rider ||
  mongoose.model("Rider", riderSchema);
