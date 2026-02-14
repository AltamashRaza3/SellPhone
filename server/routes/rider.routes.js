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

/* ================= CONSTANTS ================= */
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
/* ================= SESSION CHECK ================= */
router.get("/me", riderAuth, async (req, res) => {
  res.json({
    success: true,
    rider: req.rider,
  });
});

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
const data = pickup.toObject();
  data.phone.images =
    data.phone.images?.length > 0
      ? data.phone.images
      : data.images || [];

  res.json(data);
});

/* ================= UPLOAD VERIFICATION IMAGES ================= */
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

/* ================= VERIFY DEVICE ================= */
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

    if (!request.verification.images.length) {
      return res.status(400).json({
        message: "Upload verification images before verifying",
      });
    }

    if (!Object.values(checks).some(Boolean)) {
      return res.status(400).json({
        message: "Select at least one verification check",
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

/* ================= COMPLETE PICKUP (🔥 INVENTORY + PAYOUT) ================= */

router.put("/pickups/:id/complete", riderAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const request = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
    }).session(session);

    if (!request) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Pickup not found" });
    }

    if (request.pickup.status === "Completed") {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: "Pickup already completed" });
    }

    if (
      request.pickup.status !== "Picked" ||
      request.verification.userAccepted !== true
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        message: "User acceptance required before completion",
      });
    }

    if (!request.verification?.finalPrice) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Final price missing",
      });
    }
/* ================= REJECT PICKUP ================= */
router.put("/pickups/:id/reject", riderAuth, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Reject reason is required",
      });
    }

    const request = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
      "pickup.status": { $in: ["Scheduled", "Picked"] },
    });

    if (!request) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    request.pickup.status = "Rejected";
    request.pickup.rejectReason = reason;
    request.pickup.rejectedAt = new Date();

    request.statusHistory.push({
      status: "Pickup Rejected",
      changedBy: "rider",
      note: reason,
    });

    await request.save();

    /* ================= ADMIN ALERT ================= */
    await createAdminAlert({
      sellRequestId: request._id,
      message: `Pickup rejected by rider: ${reason}`,
      type: "pickup_rejected",
    });

    res.json({
      success: true,
      message: "Pickup rejected successfully",
    });
  } catch (err) {
    console.error("REJECT PICKUP ERROR:", err);
    res.status(500).json({ message: "Failed to reject pickup" });
  }
});

    /* ================= SAFE CONDITION ================= */
    const validConditions = ["Like New", "Excellent", "Good", "Fair"];
    const condition = validConditions.includes(
      request.phone.declaredCondition
    )
      ? request.phone.declaredCondition
      : "Good";

    /* ================= INVENTORY ================= */
    await InventoryItem.findOneAndUpdate(
      { sellRequestId: request._id },
      {
        sellRequestId: request._id,
        phone: {
          brand: request.phone.brand,
          model: request.phone.model,
          storage: request.phone.storage,
          ram: request.phone.ram,
          color: request.phone.color,
          condition,
          images: [],
        },
        purchasePrice: request.verification.finalPrice,
        status: "InStock",
      },
      { upsert: true, new: true, runValidators: true, session }
    );

    /* ================= RIDER PAYOUT ================= */
    if (!request.riderPayout?.amount) {
      request.riderPayout = {
        amount: 150,
        calculatedAt: new Date(),
      };
    }

    request.pickup.status = "Completed";
    request.pickup.completedAt = new Date();

    request.statusHistory.push({
      status: "Pickup Completed",
      changedBy: "rider",
      note: "Inventory created & payout calculated",
    });

    await request.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Pickup completed successfully",
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("🔥 COMPLETE PICKUP ERROR:", error);
    res.status(500).json({ message: error.message });
  }
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
