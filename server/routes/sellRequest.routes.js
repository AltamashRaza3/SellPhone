import express from "express";
import multer from "multer";
import SellRequest from "../src/models/SellRequest.js";
import userAuth from "../middleware/userAuth.js";
import { createSellRequest } from "../controllers/sellRequest.controller.js";
import path from "path";
import fs from "fs";

const router = express.Router();

/* ======================================================
   ENSURE UPLOAD DIRECTORY EXISTS
====================================================== */
const SELL_UPLOAD_DIR = path.join(process.cwd(), "uploads", "sell");

if (!fs.existsSync(SELL_UPLOAD_DIR)) {
  fs.mkdirSync(SELL_UPLOAD_DIR, { recursive: true });
}

/* ======================================================
   MULTER CONFIG
====================================================== */
const sellStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, SELL_UPLOAD_DIR),
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const uploadSellImages = multer({
  storage: sellStorage,
  limits: { files: 5 },
});

/* ======================================================
   VALIDATION
====================================================== */
const validateSellRequest = (req, res, next) => {
  if (!req.files || req.files.length < 3) {
    return res.status(400).json({
      message: "At least 3 phone images are required",
    });
  }

  const {
    brand,
    model,
    phone,
    storage,
    ram,
    color,
    declaredCondition,
  } = req.body;

  if (
    !brand ||
    !model ||
    !phone ||
    !storage ||
    !ram ||
    !color ||
    !declaredCondition
  ) {
    return res.status(400).json({
      message: "Missing required sell request fields",
    });
  }

  next();
};

/* ======================================================
   CREATE SELL REQUEST
====================================================== */
router.post(
  "/",
  userAuth,
  uploadSellImages.array("images", 5),
  validateSellRequest,
  createSellRequest
);

/* ======================================================
   GET MY SELL REQUESTS
====================================================== */
router.get("/my", userAuth, async (req, res) => {
  try {
    const requests = await SellRequest.find({
      "user.uid": req.user.uid,
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("FETCH MY SELL REQUESTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch sell requests" });
  }
});

/* ======================================================
   GET SINGLE SELL REQUEST
====================================================== */
router.get("/:id", userAuth, async (req, res) => {
  try {
    const request = await SellRequest.findOne({
      _id: req.params.id,
      "user.uid": req.user.uid,
    });

    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    res.json(request);
  } catch (err) {
    console.error("FETCH SELL REQUEST ERROR:", err);
    res.status(500).json({ message: "Failed to fetch sell request" });
  }
});

/* ======================================================
   SELLER CANCEL (ONLY BEFORE ADMIN APPROVAL)
====================================================== */
router.put("/:id/cancel", userAuth, async (req, res) => {
  try {
    const request = await SellRequest.findOne({
      _id: req.params.id,
      "user.uid": req.user.uid,
    });

    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    if (request.workflowStatus !== "CREATED") {
      return res.status(409).json({
        message: "Cannot cancel after approval or assignment",
      });
    }

    request.transitionStatus(
      "CANCELLED",
      "user",
      "Cancelled by seller before approval"
    );

    request.pickup.status = "Rejected";

    await request.save({ validateBeforeSave: false });

    res.json({ success: true });

  } catch (err) {
    console.error("SELLER CANCEL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ======================================================
   SELLER FINAL DECISION (PRODUCTION SAFE + OVERRIDE READY)
====================================================== */
router.put("/:id/decision", userAuth, async (req, res) => {
  try {
    const { accept } = req.body;

    if (typeof accept !== "boolean") {
      return res.status(400).json({ message: "accept must be boolean" });
    }

    const request = await SellRequest.findOne({
      _id: req.params.id,
      "user.uid": req.user.uid,
    });

    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    /* ================= STRICT STATE CHECK ================= */

    if (request.workflowStatus !== "UNDER_VERIFICATION") {
      return res.status(409).json({
        message: "Final price not available for decision",
      });
    }

    if (request.verification.userAccepted !== null) {
      return res.status(409).json({
        message: "Decision already submitted",
      });
    }

    request.verification.userAccepted = accept;

    /* ======================================================
       BUSINESS LOGIC TRANSITIONS
    ====================================================== */

    if (accept) {
      request.transitionStatus(
        "USER_ACCEPTED",
        "user",
        "User accepted final price"
      );
    } else {
      // Business override path:
      request.transitionStatus(
        "REJECTED_BY_RIDER",
        "user",
        "User rejected final price"
      );

      request.pickup.status = "Rejected";
    }

    await request.save();

    res.json({
      success: true,
      decision: accept ? "ACCEPTED" : "REJECTED",
    });

  } catch (err) {
    console.error("SELLER DECISION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
