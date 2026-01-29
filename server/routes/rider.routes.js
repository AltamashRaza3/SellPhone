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

/* ======================================================
   MULTER CONFIG
====================================================== */
const uploadDir = "uploads/pickups";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) =>
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
        file.originalname
      )}`
    ),
});

const upload = multer({ storage });

/* ======================================================
   AUTH
====================================================== */
router.post("/auth/send-otp", sendOtp);
router.post("/auth/verify-otp", verifyOtp);

/* ======================================================
   GET ASSIGNED PICKUPS
====================================================== */
router.get("/pickups", riderAuth, async (req, res) => {
  try {
    const pickups = await SellRequest.find({
      "assignedRider.riderId": req.rider.riderId,
      "pickup.status": {
        $in: ["Scheduled", "Picked", "Completed", "Rejected"],
      },
    }).sort({ "pickup.scheduledAt": 1 });

    res.json(pickups);
  } catch {
    res.status(500).json({ message: "Failed to load pickups" });
  }
});

/* ======================================================
   GET PICKUP DETAILS
====================================================== */
router.get("/pickups/:id", riderAuth, async (req, res) => {
  try {
    const pickup = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
    });

    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    res.json(pickup);
  } catch {
    res.status(500).json({ message: "Failed to load pickup" });
  }
});

/* ======================================================
   UPLOAD VERIFICATION IMAGES
====================================================== */
router.post(
  "/pickups/:id/upload-images",
  riderAuth,
  upload.array("images", 6),
  async (req, res) => {
    try {
      if (!req.files?.length) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      const request = await SellRequest.findOne({
        _id: req.params.id,
        "assignedRider.riderId": req.rider.riderId,
      });

      if (!request) {
        return res.status(404).json({ message: "Pickup not found" });
      }

      if (["Completed", "Rejected"].includes(request.pickup.status)) {
        return res.status(409).json({
          message: "Pickup already closed",
        });
      }

      const images = req.files.map((file) => ({
        url: `/uploads/pickups/${file.filename}`,
        uploadedAt: new Date(),
        uploadedBy: req.rider.riderId,
      }));

      await SellRequest.updateOne(
        { _id: request._id },
        { $push: { "verification.images": { $each: images } } }
      );

      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Image upload failed" });
    }
  }
);

/* ======================================================
   VERIFY DEVICE
====================================================== */
router.put("/pickups/:id/verify", riderAuth, async (req, res) => {
  try {
    const { checks = {}, riderNotes = "" } = req.body;

    const request = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
    });

    if (!request) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    if (
      request.pickup.status !== "Scheduled" &&
      request.pickup.status !== "Picked"
    ) {
      return res.status(409).json({
        message: "Pickup cannot be verified in current state",
      });
    }

    const { deductions, finalPrice } = calculateFinalPrice(
      request.pricing.basePrice,
      checks
    );

    request.verification.checks = checks;
    request.verification.deductions = deductions;
    request.verification.finalPrice = finalPrice;
    request.verification.verifiedAt = new Date();
    request.verification.verifiedBy = req.rider.riderId;
    request.verification.riderNotes = riderNotes;

    request.pricing.finalPrice = finalPrice;
    request.pickup.status = "Picked";

    request.statusHistory.push({
      status: "Device Verified",
      changedBy: "rider",
    });

    await request.save();

    res.json({ success: true, finalPrice });
  } catch {
    res.status(500).json({ message: "Verification failed" });
  }
});

/* ======================================================
   REJECT PICKUP (CORE PHASE 4)
====================================================== */
router.put("/pickups/:id/reject", riderAuth, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason?.trim()) {
      return res.status(400).json({ message: "Rejection reason required" });
    }

    const request = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
    });

    if (!request) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    if (request.pickup.status === "Completed") {
      return res.status(409).json({
        message: "Completed pickup cannot be rejected",
      });
    }

    request.pickup.status = "Rejected";

    request.statusHistory.push({
      status: "Pickup Rejected by Rider",
      changedBy: "rider",
      note: reason,
    });

    await request.save();

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to reject pickup" });
  }
});

/* ======================================================
   COMPLETE PICKUP → CREATE INVENTORY
====================================================== */
router.put("/pickups/:id/complete", riderAuth, async (req, res) => {
  try {
    const request = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
      "pickup.status": "Picked",
      "verification.finalPrice": { $exists: true },
      "verification.userAccepted": true, // 🔒 user must accept price
    });

    if (!request) {
      return res.status(400).json({
        message: "User acceptance required before completion",
      });
    }

    /* ================= CREATE / UPSERT INVENTORY ================= */
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
          condition: request.phone.declaredCondition,
        },
        purchasePrice: request.verification.finalPrice,
      },
      { upsert: true, new: true }
    );

    request.pickup.status = "Completed";
    request.pickup.completedAt = new Date();

    request.statusHistory.push({
      status: "Inventory Created",
      changedBy: "system",
    });

    await request.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Pickup completion failed" });
  }
});

/* ======================================================
   RIDER EARNINGS
====================================================== */
router.get("/earnings", riderAuth, async (req, res) => {
  try {
    const COMMISSION = 300;

    const completed = await SellRequest.countDocuments({
      "assignedRider.riderId": req.rider.riderId,
      "pickup.status": "Completed",
    });

    res.json({
      totalPickups: completed,
      totalEarnings: completed * COMMISSION,
      commissionPerPickup: COMMISSION,
    });
  } catch {
    res.status(500).json({ message: "Failed to load earnings" });
  }
});

export default router;
