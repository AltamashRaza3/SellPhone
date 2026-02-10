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

    city: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    createdBy: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },

    /* OTP (temporary) */
    otp: String,
    otpExpiresAt: Date,

    /* Audit */
    lastLoginAt: Date,
    statusUpdatedAt: Date,
    statusUpdatedBy: String,
  },
  { timestamps: true }
);

export default mongoose.models.Rider ||
  mongoose.model("Rider", riderSchema);
