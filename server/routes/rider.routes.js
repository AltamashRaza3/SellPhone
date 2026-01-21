import express from "express";
import multer from "multer";
import SellRequest from "../models/SellRequest.js";
import riderAuth from "../middleware/riderAuth.js";
import {
  sendOtp,
  verifyOtp,
} from "../controllers/riderAuth.controller.js";

const router = express.Router();

/* ======================================================
   MULTER CONFIG (PICKUP IMAGES)
====================================================== */
const storage = multer.diskStorage({
  destination: "uploads/pickups",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
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
   GET SINGLE PICKUP DETAILS
====================================================== */
router.get("/pickups/:id", riderAuth, async (req, res) => {
  try {
    const pickup = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
    }).lean();

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
   UPLOAD PICKUP IMAGES (MANDATORY BEFORE COMPLETE)
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

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      if (!pickup.verification) {
        pickup.verification = {};
      }

      pickup.verification.images = req.files.map(
        (f) => `/uploads/pickups/${f.filename}`
      );

      pickup.history.push({
        action: "Images Uploaded",
        by: req.rider.name,
        note: `${req.files.length} images uploaded by rider`,
        at: new Date(),
      });

      await pickup.save();

      res.json({
        success: true,
        images: pickup.verification.images,
      });
    } catch (err) {
      console.error("UPLOAD IMAGES ERROR:", err);
      res.status(500).json({ message: "Failed to upload images" });
    }
  }
);

/* ======================================================
   MARK PICKUP AS PICKED
====================================================== */
router.put("/pickups/:id/picked", riderAuth, async (req, res) => {
  try {
    const { notes } = req.body;

    const pickup = await SellRequest.findOne({
      _id: req.params.id,
      "assignedRider.riderId": req.rider.riderId,
    });

    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    if (pickup.pickup.status !== "Scheduled") {
      return res.status(400).json({ message: "Pickup already processed" });
    }

    pickup.pickup.status = "Picked";

    pickup.verification = {
      ...(pickup.verification || {}),
      riderNotes: notes || "",
      verifiedAt: new Date(),
    };

    pickup.history.push({
      action: "Picked",
      by: req.rider.name,
      note: notes || "Pickup marked as picked",
      at: new Date(),
    });

    await pickup.save();

    res.json({ success: true });
  } catch (err) {
    console.error("MARK PICKED ERROR:", err);
    res.status(500).json({ message: "Failed to mark pickup as picked" });
  }
});

/* ======================================================
   MARK PICKUP AS COMPLETED (FINAL)
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

    if (pickup.pickup.status !== "Picked") {
      return res.status(400).json({ message: "Pickup not picked yet" });
    }

    if (!pickup.verification?.images?.length) {
      return res.status(400).json({
        message: "Upload images before completing pickup",
      });
    }

    pickup.pickup.status = "Completed";
    pickup.status = "Picked"; // user decision phase later
    pickup.verification.verifiedAt = new Date();

    pickup.history.push({
      action: "Completed",
      by: req.rider.name,
      note: "Pickup completed successfully",
      at: new Date(),
    });

    await pickup.save();

    res.json({ success: true });
  } catch (err) {
    console.error("MARK COMPLETED ERROR:", err);
    res.status(500).json({ message: "Failed to complete pickup" });
  }
});
/* ================= REJECT PICKUP ================= */
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

    if (!["Scheduled", "Picked"].includes(pickup.pickup.status)) {
      return res.status(400).json({ message: "Pickup cannot be rejected now" });
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

    const completedPickups = await SellRequest.find({
      "assignedRider.riderId": req.rider.riderId,
      "pickup.status": "Completed",
    }).lean();

    const totalPickups = completedPickups.length;
    const totalEarnings = totalPickups * COMMISSION_PER_PICKUP;

    res.json({
      totalPickups,
      totalEarnings,
      commissionPerPickup: COMMISSION_PER_PICKUP,
    });
  } catch (err) {
    console.error("RIDER EARNINGS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch earnings" });
  }
});

export default router;
