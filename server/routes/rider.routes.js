import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import SellRequest from "../src/models/SellRequest.js";
import InventoryItem from "../models/InventoryItem.js";

import riderAuth from "../middleware/riderAuth.js";
import { sendOtp, verifyOtp } from "../controllers/riderAuth.controller.js";
import { calculateFinalPrice } from "../utils/priceRules.js";

const router = express.Router();

/* ================= MULTER ================= */
const uploadDir = "uploads/pickups";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) =>
    cb(
      null,
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}${path.extname(file.originalname)}`
    ),
});

const upload = multer({ storage });

/* ================= AUTH ================= */
router.post("/auth/send-otp", sendOtp);
router.post("/auth/verify-otp", verifyOtp);

/* ================= PICKUPS LIST ================= */
router.get("/pickups", riderAuth, async (req, res) => {
  try {
    const pickups = await SellRequest.find({
      "assignedRider.riderId": req.rider.riderId,
      "pickup.status": { $in: ["Scheduled", "Picked", "Completed"] },
    }).sort({ "pickup.scheduledAt": 1 });

    res.json(pickups);
  } catch {
    res.status(500).json({ message: "Failed to load pickups" });
  }
});

/* ================= PICKUP DETAILS ================= */
router.get("/pickups/:id", riderAuth, async (req, res) => {
  const pickup = await SellRequest.findOne({
    _id: req.params.id,
    "assignedRider.riderId": req.rider.riderId,
  });

  if (!pickup) {
    return res.status(404).json({ message: "Pickup not found" });
  }

  res.json(pickup);
});

/* ================= UPLOAD IMAGES ================= */
router.post(
  "/pickups/:id/upload-images",
  riderAuth,
  upload.array("images", 6),
  async (req, res) => {
    if (!req.files?.length) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const request = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
      "pickup.status": { $in: ["Scheduled", "Picked"] },
    });

    if (!request) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    const images = req.files.map((file) => ({
      url: `/uploads/pickups/${file.filename}`,
      uploadedBy: req.rider.riderId,
      uploadedAt: new Date(),
    }));

    request.verification.images.push(...images);

    await request.save();

    res.json({ success: true });
  }
);

/* ================= VERIFY DEVICE (🔥 CRITICAL) ================= */
router.put("/pickups/:id/verify", riderAuth, async (req, res) => {
  try {
    const { checks = {} } = req.body;

    const request = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
      "pickup.status": { $in: ["Scheduled", "Picked"] },
    });

    if (!request) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    if (request.verification.finalPrice != null) {
      return res.status(409).json({ message: "Already verified" });
    }

    const { deductions, finalPrice } = calculateFinalPrice(
      request.pricing.basePrice,
      checks
    );

    /* ✅ SINGLE SOURCE OF TRUTH */
    request.verification = {
      ...request.verification,
      checks,
      deductions,
      finalPrice,
      verifiedBy: req.rider.riderId,
      verifiedAt: new Date(),
      userAccepted: null,
    };

    request.pickup.status = "Picked";

    request.statusHistory.push({
      status: "Device Verified",
      changedBy: "rider",
      note: `Final price ₹${finalPrice}`,
    });

    await request.save();

    res.json({ success: true, finalPrice });
  } catch (err) {
    console.error("VERIFY DEVICE ERROR:", err);
    res.status(500).json({ message: "Failed to verify device" });
  }
});

/* ================= REJECT PICKUP ================= */
router.put("/pickups/:id/reject", riderAuth, async (req, res) => {
  const { reason } = req.body;

  if (!reason?.trim()) {
    return res.status(400).json({ message: "Reason required" });
  }

  const request = await SellRequest.findOne({
    _id: req.params.id,
    "assignedRider.riderId": req.rider.riderId,
  });

  if (!request) {
    return res.status(404).json({ message: "Pickup not found" });
  }

  request.pickup.status = "Rejected";
  request.pickup.rejectedReason = reason;

  request.statusHistory.push({
    status: "Pickup Rejected by Rider",
    changedBy: "rider",
    note: reason,
  });

  await request.save();

  res.json({ success: true });
});

/* ================= COMPLETE PICKUP ================= */
router.put("/pickups/:id/complete", riderAuth, async (req, res) => {
  const request = await SellRequest.findOne({
    _id: req.params.id,
    "assignedRider.riderId": req.rider.riderId,
    "pickup.status": "Picked",
    "verification.userAccepted": true,
  });

  if (!request) {
    return res.status(409).json({
      message: "User acceptance required",
    });
  }

  // ✅ ENSURE PAYOUT IS SET
  if (!request.riderPayout?.amount) {
    request.riderPayout = {
      amount: 150, // fixed payout (can change later)
      calculatedAt: new Date(),
    };
  }

  request.pickup.status = "Completed";
  request.pickup.completedAt = new Date();

  await request.save();
  res.json({ success: true });
});

/* ================= RIDER EARNINGS ================= */
router.get("/earnings", riderAuth, async (req, res) => {
  try {
    const completed = await SellRequest.find({
      "assignedRider.riderId": req.rider.riderId,
      "pickup.status": "Completed",
    }).select("riderPayout.amount");

    const totalEarnings = completed.reduce(
      (sum, r) => sum + (r.riderPayout?.amount || 0),
      0
    );

    res.json({
      totalEarnings,
      completedPickups: completed.length,
    });
  } catch {
    res.status(500).json({ message: "Failed to load earnings" });
  }
});

export default router;
