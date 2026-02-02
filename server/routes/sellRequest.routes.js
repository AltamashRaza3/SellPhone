import express from "express";
import multer from "multer";
import SellRequest from "../src/models/SellRequest.js";
import userAuth from "../middleware/userAuth.js";
import { createSellRequest } from "../controllers/sellRequest.controller.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/* ======================================================
   ENSURE UPLOAD DIRECTORY EXISTS
====================================================== */
const SELL_UPLOAD_DIR = path.join(process.cwd(), "uploads", "sell");

if (!fs.existsSync(SELL_UPLOAD_DIR)) {
  fs.mkdirSync(SELL_UPLOAD_DIR, { recursive: true });
}

/* ======================================================
   MULTER CONFIG (SELL IMAGES)
====================================================== */
const sellStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, SELL_UPLOAD_DIR);
  },
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadSellImages = multer({
  storage: sellStorage,
  limits: { files: 5 },
});

/* ======================================================
   VALIDATION (BEFORE CONTROLLER)
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
   CREATE SELL REQUEST (USER)
====================================================== */
router.post(
  "/",
  userAuth,
  uploadSellImages.array("images", 5),
  validateSellRequest,
  createSellRequest
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
    console.error("FETCH MY SELL REQUESTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch sell requests" });
  }
});

/* ======================================================
   GET SINGLE SELL REQUEST (USER)
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
   SELLER CANCEL (BEFORE RIDER ASSIGNED)
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

    if (request.assignedRider?.riderId) {
      return res.status(409).json({
        message: "Cannot cancel after rider assignment",
      });
    }

    if (request.pickup?.status !== "Pending") {
      return res.status(409).json({
        message: "Cannot cancel after pickup scheduling",
      });
    }

    if (request.verification?.finalPrice) {
      return res.status(409).json({
        message: "Cannot cancel after final price generation",
      });
    }

    request.pickup.status = "Rejected";

    request.statusHistory.push({
      status: "Cancelled by Seller",
      changedBy: "user",
      changedAt: new Date(),
    });

    await request.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: "Sell request cancelled successfully",
    });
  } catch (err) {
    console.error("SELLER CANCEL ERROR:", err);
    res.status(500).json({ message: "Failed to cancel request" });
  }
});

/* ======================================================
   SELLER FINAL DECISION
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

    if (request.admin?.status !== "Approved") {
      return res.status(400).json({
        message: "Request not approved by admin yet",
      });
    }

    if (!request.verification?.finalPrice) {
      return res.status(400).json({
        message: "Final price not generated yet",
      });
    }

    if (request.verification.userAccepted !== null) {
      return res.status(400).json({
        message: "Decision already submitted",
      });
    }

    request.verification.userAccepted = accept;

    if (!accept) {
      request.pickup.status = "Rejected";
    }

    request.statusHistory.push({
      status: accept
        ? "User Accepted Final Price"
        : "User Rejected Final Price",
      changedBy: "user",
      changedAt: new Date(),
    });

    await request.save({ validateBeforeSave: false });

    res.json({
      success: true,
      decision: accept ? "ACCEPTED" : "REJECTED",
    });
  } catch (err) {
    console.error("SELLER DECISION ERROR:", err);
    res.status(500).json({ message: "Failed to submit decision" });
  }
});

/* ======================================================
   DOWNLOAD INVOICE (USER)
====================================================== */
router.get("/:id/invoice", userAuth, async (req, res) => {
  try {
    const request = await SellRequest.findOne({
      _id: req.params.id,
      "user.uid": req.user.uid,
    });

    if (!request || !request.invoice?.url) {
      return res.status(404).json({
        message: "Invoice not available",
      });
    }

    const relativePath = request.invoice.url.replace(/^\/+/, "");
    const filePath = path.resolve(process.cwd(), relativePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Invoice file missing on server",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${path.basename(filePath)}"`
    );

    res.sendFile(filePath);
  } catch (err) {
    console.error("INVOICE DOWNLOAD ERROR:", err);
    res.status(500).json({ message: "Failed to download invoice" });
  }
});

export default router;
