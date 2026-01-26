import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import SellRequest from "../models/SellRequest.js";
import riderAuth from "../middleware/riderAuth.js";
import { sendOtp, verifyOtp } from "../controllers/riderAuth.controller.js";
import { calculateFinalPrice } from "../utils/priceRules.js";

const router = express.Router();

/* ======================================================
   MULTER CONFIG (PRODUCTION SAFE)
====================================================== */
const uploadDir = "uploads/pickups";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

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
      "pickup.status": { $in: ["Scheduled", "Picked"] },
    })
      .sort({ "pickup.scheduledAt": 1 })
      .lean();

    res.json(pickups);
  } catch (err) {
    console.error("FETCH PICKUPS ERROR:", err);
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
  } catch (err) {
    console.error("FETCH PICKUP ERROR:", err);
    res.status(500).json({ message: "Failed to load pickup" });
  }
});

/* ======================================================
   VERIFY DEVICE (FINAL – SAFE)
====================================================== */
router.put("/pickups/:id/verify", riderAuth, async (req, res) => {
  try {
    const { checks = {}, riderNotes = "" } = req.body;

    const pickup = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
    });

    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    if (pickup.pickup.status !== "Scheduled") {
      return res.status(400).json({
        message: "Pickup must be scheduled before verification",
      });
    }

    const { deductions, finalPrice } = calculateFinalPrice(
      pickup.expectedPrice,
      checks
    );

    /* 🔐 HARD RESET verification (CRITICAL FIX) */
    pickup.verification = {
      checks,
      deductions,
      finalPrice,
      riderNotes,
      verifiedAt: new Date(),
      verifiedBy: req.rider.riderId,
      images: [], // MUST be empty array of OBJECTS
    };

    pickup.pickup.status = "Picked";

    pickup.history.push({
      action: "DEVICE_VERIFIED",
      by: req.rider.riderId,
      note: "Device verified by rider",
      at: new Date(),
    });

    await pickup.save();

    res.json({ success: true, finalPrice, deductions });
  } catch (err) {
    console.error("VERIFY DEVICE ERROR:", err);
    res.status(500).json({ message: "Device verification failed" });
  }
});

/* ======================================================
   UPLOAD DEVICE IMAGES (CASTERROR PROOF)
====================================================== */
router.post(
  "/pickups/:id/upload-images",
  riderAuth,
  upload.array("images", 6),
  async (req, res) => {
    try {
      const pickup = await SellRequest.findOne({
        _id: req.params.id,
        "assignedRider.riderId": req.rider.riderId,
      });

      if (!pickup) {
        return res.status(404).json({ message: "Pickup not found" });
      }

      if (!req.files?.length) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      /* 🔐 ABSOLUTE CAST FIX */
      pickup.verification.images = [];

      req.files.forEach((file) => {
        pickup.verification.images.push({
          url: `/uploads/pickups/${file.filename}`,
          uploadedAt: new Date(),
          uploadedBy: req.rider.riderId,
        });
      });

      pickup.history.push({
        action: "IMAGES_UPLOADED",
        by: req.rider.riderId,
        note: `${req.files.length} images uploaded`,
        at: new Date(),
      });

      await pickup.save();
      res.json({ success: true });
    } catch (err) {
      console.error("UPLOAD IMAGES ERROR:", err);
      res.status(500).json({ message: "Image upload failed" });
    }
  }
);

/* ======================================================
   COMPLETE PICKUP
====================================================== */
router.put("/pickups/:id/complete", riderAuth, async (req, res) => {
  try {
    const pickup = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
    });

    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    if (!pickup.verification?.images?.length) {
      return res.status(400).json({
        message: "Upload images before completing pickup",
      });
    }

    pickup.pickup.status = "Completed";

    pickup.history.push({
      action: "PICKUP_COMPLETED",
      by: req.rider.riderId,
      note: "Pickup completed",
      at: new Date(),
    });

    await pickup.save();
    res.json({ success: true });
  } catch (err) {
    console.error("COMPLETE PICKUP ERROR:", err);
    res.status(500).json({ message: "Failed to complete pickup" });
  }
});

/* ======================================================
   REJECT PICKUP
====================================================== */
router.put("/pickups/:id/reject", riderAuth, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason required" });
    }

    const pickup = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
    });

    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    pickup.finalStatus = "Closed";

    pickup.history.push({
      action: "REJECTED_BY_RIDER",
      by: req.rider.riderId,
      note: reason,
      at: new Date(),
    });

    await pickup.save();
    res.json({ success: true });
  } catch (err) {
    console.error("REJECT PICKUP ERROR:", err);
    res.status(500).json({ message: "Failed to reject pickup" });
  }
});

/* ======================================================
   RIDER EARNINGS
====================================================== */
router.get("/earnings", riderAuth, async (req, res) => {
  try {
    const COMMISSION_PER_PICKUP = 300;

    const completed = await SellRequest.countDocuments({
      "assignedRider.riderId": req.rider.riderId,
      "pickup.status": "Completed",
    });

    res.json({
      totalPickups: completed,
      totalEarnings: completed * COMMISSION_PER_PICKUP,
      commissionPerPickup: COMMISSION_PER_PICKUP,
    });
  } catch (err) {
    console.error("EARNINGS ERROR:", err);
    res.status(500).json({ message: "Failed to load earnings" });
  }
});

export default router;
