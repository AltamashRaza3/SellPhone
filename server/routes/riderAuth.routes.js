// routes/riderAuth.routes.js
import express from "express";
import Rider from "../models/Rider.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ================= SEND OTP ================= */
router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    const rider = await Rider.findOne({ phone, status: "active" });
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    rider.otp = otp;
    rider.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await rider.save();

    /* TEMP: log OTP (replace with SMS later) */
    console.log(`RIDER OTP (${phone}):`, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP required" });
    }

    const rider = await Rider.findOne({ phone });
    if (
      !rider ||
      rider.otp !== otp ||
      rider.otpExpiresAt < new Date()
    ) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    rider.otp = null;
    rider.otpExpiresAt = null;
    rider.lastLoginAt = new Date();
    await rider.save();

    const token = jwt.sign(
      { riderId: rider._id, role: "rider" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      rider: {
        id: rider._id,
        name: rider.name,
        phone: rider.phone,
      },
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

export default router;
