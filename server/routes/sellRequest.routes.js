import express from "express";
import multer from "multer";
import SellRequest from "../src/models/SellRequest.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import {
  createSellRequest,
  assignRider,
} from "../controllers/sellRequest.controller.js";

const router = express.Router();

/* ================= MULTER ================= */
const sellStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/sell"),
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const uploadSellImages = multer({ storage: sellStorage });

/* ================= CREATE SELL REQUEST ================= */
router.post(
  "/",
  userAuth,
  uploadSellImages.array("images", 5),
  createSellRequest
);

/* ================= GET MY SELL REQUESTS ================= */
router.get("/my", userAuth, async (req, res) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const requests = await SellRequest.find({
      "user.uid": req.user.uid,
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("FETCH MY SELL REQUESTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch sell requests" });
  }
});

/* ================= SELLER DECISION (FINAL PRICE) ================= */
router.put("/:id/decision", userAuth, async (req, res) => {
  try {
    const { accept } = req.body;

    if (typeof accept !== "boolean") {
      return res.status(400).json({
        message: "accept must be boolean",
      });
    }

    const request = await SellRequest.findOne({
      _id: req.params.id,
      "user.uid": req.user.uid,
    }).lean();

    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    if (!request.verification?.finalPrice) {
      return res.status(400).json({
        message: "Final price not available yet",
      });
    }

    if (request.verification.userAccepted !== null) {
      return res.status(400).json({
        message: "Decision already submitted",
      });
    }

    // 🔐 UPDATE WITHOUT VALIDATION (LEGACY SAFE)
    await SellRequest.updateOne(
      { _id: request._id },
      {
        $set: {
          "verification.userAccepted": accept,
          status: accept ? "Completed" : "Cancelled",
        },
        $push: {
          statusHistory: {
            status: accept
              ? "User Accepted Final Price"
              : "User Rejected Final Price",
            changedBy: "user",
            changedAt: new Date(),
          },
        },
      }
    );

    res.json({
      success: true,
      decision: accept ? "ACCEPTED" : "REJECTED",
    });
  } catch (err) {
    console.error("SELLER DECISION ERROR:", err);
    res.status(500).json({ message: "Failed to submit decision" });
  }
});

/* ================= ASSIGN RIDER ================= */
router.put("/:id/assign-rider", adminAuth, assignRider);

export default router;
