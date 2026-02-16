import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import SellRequest from "../src/models/SellRequest.js";
import InventoryItem from "../models/InventoryItem.js";
import { createAdminAlert } from "../utils/adminAlert.js";

import riderAuth from "../middleware/riderAuth.js";
import { sendOtp, verifyOtp } from "../controllers/riderAuth.controller.js";
import { calculateFinalPrice } from "../utils/priceRules.js";

const router = express.Router();

const RIDER_PAYOUT_AMOUNT = 150;

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

router.get("/me", riderAuth, async (req, res) => {
  res.json({ success: true, rider: req.rider });
});

/* ================= PICKUPS LIST ================= */
router.get("/pickups", riderAuth, async (req, res) => {
  try {
    const pickups = await SellRequest.find({
      "assignedRider.riderId": req.rider.riderId,
      workflowStatus: {
        $in: [
          "ASSIGNED_TO_RIDER",
          "UNDER_VERIFICATION",
          "USER_ACCEPTED",
          "COMPLETED",
        ],
      },
    }).sort({ "pickup.scheduledAt": 1 });

    res.json(pickups);
  } catch {
    res.status(500).json({ message: "Failed to load pickups" });
  }
});

/* ================= VERIFY DEVICE ================= */
router.put("/pickups/:id/verify", riderAuth, async (req, res) => {
  try {
    const { checks = {} } = req.body;

    const request = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
      workflowStatus: "ASSIGNED_TO_RIDER",
    });

    if (!request) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    if (!request.verification.images.length) {
      return res.status(400).json({
        message: "Upload verification images before verifying",
      });
    }

    const { deductions, finalPrice } = calculateFinalPrice(
      request.pricing.basePrice,
      checks
    );

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

    request.transitionStatus(
      "UNDER_VERIFICATION",
      "rider",
      `Final price ₹${finalPrice}`
    );

    await request.save();

    res.json({ success: true, finalPrice });

  } catch (err) {
    console.error("VERIFY DEVICE ERROR:", err);
    res.status(500).json({ message: "Failed to verify device" });
  }
});

/* ================= REJECT PICKUP ================= */
router.put("/pickups/:id/reject", riderAuth, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason?.trim()) {
      return res.status(400).json({
        message: "Reject reason is required",
      });
    }

    const request = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
      workflowStatus: { $in: ["ASSIGNED_TO_RIDER", "UNDER_VERIFICATION"] },
    });

    if (!request) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    request.pickup.status = "Rejected";
    request.pickup.rejectReason = reason;
    request.pickup.rejectedAt = new Date();

    request.transitionStatus(
      "REJECTED_BY_RIDER",
      "rider",
      reason
    );

    await request.save();

    await createAdminAlert({
      sellRequestId: request._id,
      message: `Pickup rejected by rider: ${reason}`,
      type: "pickup_rejected",
    });

    res.json({ success: true });

  } catch (err) {
    console.error("REJECT PICKUP ERROR:", err);
    res.status(500).json({ message: "Failed to reject pickup" });
  }
});

/* ================= COMPLETE PICKUP ================= */
router.put("/pickups/:id/complete", riderAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const request = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
      workflowStatus: "USER_ACCEPTED",
    }).session(session);

    if (!request) {
      throw new Error("Pickup not found");
    }

    await InventoryItem.findOneAndUpdate(
      { sellRequestId: request._id },
      {
        sellRequestId: request._id,
        phone: request.phone,
        purchasePrice: request.verification.finalPrice,
        status: "InStock",
      },
      { upsert: true, session }
    );

    request.riderPayout = {
      amount: RIDER_PAYOUT_AMOUNT,
      calculatedAt: new Date(),
    };

    request.pickup.status = "Completed";
    request.pickup.completedAt = new Date();

    request.transitionStatus(
      "COMPLETED",
      "rider",
      "Pickup completed successfully"
    );

    await request.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
});

/* ================= RIDER EARNINGS ================= */
router.get("/earnings", riderAuth, async (req, res) => {
  try {
    const completed = await SellRequest.find({
      "assignedRider.riderId": req.rider.riderId,
      workflowStatus: "COMPLETED",
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
