import express from "express";
import multer from "multer";
import SellRequest from "../models/SellRequest.js";
import riderAuth from "../middleware/riderAuth.js";
import {
  sendOtp,
  verifyOtp,
} from "../controllers/riderAuth.controller.js";
import { calculateFinalPrice } from "../utils/priceRules.js";

const router = express.Router();

/* ======================================================
   MULTER CONFIG
====================================================== */
const storage = multer.diskStorage({
  destination: "uploads/pickups",
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
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
   VERIFY DEVICE (PRICE CALCULATION HAPPENS HERE)
====================================================== */
router.put("/pickups/:id/verify", riderAuth, async (req, res) => {
  try {
    const { checks, riderNotes } = req.body;

    const pickup = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
    });

    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    if (pickup.pickup.status !== "Scheduled") {
      return res.status(400).json({ message: "Invalid pickup state" });
    }

    const { deductions, finalPrice } = calculateFinalPrice(
      pickup.expectedPrice,
      checks
    );

    pickup.verification = {
      checks,
      deductions,
      finalPrice,
      riderNotes: riderNotes || "",
      verifiedAt: new Date(),
      images: pickup.verification?.images || [],
    };

    pickup.pickup.status = "Picked";
    pickup.status = "Picked";

    pickup.history.push({
      action: "Device Verified",
      by: req.rider.name,
      note: "Condition verified by rider",
    });

    await pickup.save();

    res.json({
      message: "Device verified",
      finalPrice,
      deductions,
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ message: "Verification failed" });
  }
});

/* ======================================================
   UPLOAD DEVICE IMAGES (MANDATORY)
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

      pickup.verification = pickup.verification || {};
      pickup.verification.images = req.files.map(
        (f) => `/uploads/pickups/${f.filename}`
      );

      pickup.history.push({
        action: "Images Uploaded",
        by: req.rider.name,
        note: `${req.files.length} images uploaded`,
      });

      await pickup.save();

      res.json({ success: true });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ message: "Image upload failed" });
    }
  }
);

/* ======================================================
   COMPLETE PICKUP (USER DECIDES NEXT)
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
      action: "Pickup Completed",
      by: req.rider.name,
      note: "Awaiting user confirmation",
    });

    await pickup.save();

    res.json({ success: true });
  } catch (err) {
    console.error("COMPLETE ERROR:", err);
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

    pickup.pickup.status = "Completed";
    pickup.status = "Cancelled";

    pickup.history.push({
      action: "Rejected by Rider",
      by: req.rider.name,
      note: reason,
    });

    await pickup.save();

    res.json({ success: true });
  } catch (err) {
    console.error("REJECT ERROR:", err);
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
