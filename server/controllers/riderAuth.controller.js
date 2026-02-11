import jwt from "jsonwebtoken";
import Rider from "../models/Rider.js";

/**
 * TEMP OTP STORE
 * In production, replace with Redis / SMS provider
 */
const otpStore = new Map();

/* ======================================================
   SEND OTP
====================================================== */
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const rider = await Rider.findOne({ phone, status: "active" });
    if (!rider) {
      return res.status(403).json({
        message: "Rider account is inactive. Contact admin.",
      });
    }

    // TEMP OTP (static for now)
    const otp = "123456";
    otpStore.set(phone, otp);

    console.log(`📲 RIDER OTP for ${phone}: ${otp}`);

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ======================================================
   VERIFY OTP + ISSUE JWT
====================================================== */
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    const storedOtp = otpStore.get(phone);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const rider = await Rider.findOne({ phone, status: "active" });
    if (!rider) {
      return res.status(403).json({
        message: "Rider account is inactive. Contact admin.",
      });
    }

    otpStore.delete(phone);

    rider.lastLoginAt = new Date();
    await rider.save();

    const token = jwt.sign(
      {
        riderId: rider._id.toString(),
        role: "rider",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ SET SECURE COOKIE
    res.cookie("riderToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      rider: {
        _id: rider._id,
        name: rider.name,
        phone: rider.phone,
      },
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

