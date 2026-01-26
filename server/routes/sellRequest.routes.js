import express from "express";
import SellRequest from "../models/SellRequest.js";
import Rider from "../models/Rider.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import { calculateBasePrice } from "../utils/priceRules.js";
import multer from "multer";

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: "uploads/pickups",
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

const router = express.Router();

/* ======================================================
   CREATE SELL REQUEST (USER)
====================================================== */
router.post(
  "/",
  userAuth,
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length < 3) {
        return res.status(400).json({
          message: "At least 3 phone images are required",
        });
      }

      const {
        brand,
        model,
        storage,
        ram,
        color,
        declaredCondition,
        purchaseYear,
        phone,
        fullAddress,
        city,
        state,
        pincode,
      } = req.body;

      if (
        !brand ||
        !model ||
        !declaredCondition ||
        !purchaseYear ||
        !phone ||
        !fullAddress ||
        !city ||
        !state ||
        !pincode
      ) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

      const imageUrls = req.files.map(
        (file) => `/uploads/pickups/${file.filename}`
      );

      const catalog = {
        baseMarketPrice: 22000,
        depreciationPerYear: 0.12,
        maxDepreciation: 0.6,
      };

      const basePrice = calculateBasePrice({
        catalog,
        purchaseYear: Number(purchaseYear),
        declaredCondition,
      });

      const request = await SellRequest.create({
        user: {
          uid: req.user.uid,
          email: req.user.email,
        },

        phone: {
          brand,
          model,
          storage,
          ram,
          color,
          declaredCondition,
          purchaseYear: Number(purchaseYear),
          images: imageUrls,
        },

        contact: {
          phone,
          email: req.user.email,
        },

        pricing: {
          basePrice,
        },

        pickup: {
          status: "NotScheduled",
          address: {
            line1: fullAddress,
            city,
            state,
            pincode,
          },
        },

        admin: {
          status: "Pending",
        },

        statusHistory: [
          {
            status: "Request Created",
            changedBy: "user",
          },
        ],
      });

      res.status(201).json(request);
    } catch (err) {
      console.error("CREATE SELL REQUEST ERROR:", err);
      res.status(500).json({
        message: "Failed to create sell request",
      });
    }
  }
);

/* ======================================================
   GET MY SELL REQUESTS (USER)
====================================================== */
router.get("/my", userAuth, async (req, res) => {
  try {
    const requests = await SellRequest.find({
      "user.uid": req.user.uid,
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("FETCH USER REQUESTS ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch sell requests",
    });
  }
});

/* ======================================================
   ASSIGN RIDER (ADMIN)
====================================================== */
router.put("/:id/assign-rider", adminAuth, async (req, res) => {
  try {
    const { riderId, scheduledAt } = req.body;

    if (!riderId) {
      return res.status(400).json({
        message: "Rider ID required",
      });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    if (request.admin?.status !== "Approved") {
      return res.status(409).json({
        message: "Admin approval required",
      });
    }

    if (request.assignedRider?.riderId) {
      return res.status(409).json({
        message: "Rider already assigned",
      });
    }

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    request.assignedRider = {
      riderId: rider._id.toString(),
      riderName: rider.name,
      assignedAt: new Date(),
    };

    request.pickup.status = "Scheduled";
    request.pickup.scheduledAt = scheduledAt
      ? new Date(scheduledAt)
      : new Date();

    request.statusHistory.push({
      status: "Pickup Scheduled",
      changedBy: "admin",
      note: `Assigned to rider ${rider.name}`,
    });

    await request.save();
    res.json(request);
  } catch (err) {
    console.error("ASSIGN RIDER ERROR:", err);
    res.status(500).json({
      message: "Failed to assign rider",
    });
  }
});

export default router;
