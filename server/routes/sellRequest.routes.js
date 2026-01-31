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

/* ================= MULTER ================= */
const sellStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("uploads", "sell"));
  },
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const uploadSellImages = multer({ storage: sellStorage });

/* ======================================================
   CREATE SELL REQUEST (USER)
====================================================== */
router.post(
  "/",
  userAuth,
  uploadSellImages.array("images", 5),
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
   GET SINGLE SELL REQUEST (USER)  ✅ CRITICAL
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

    /* ❌ HARD LOCKS */
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

    /* ✅ CANCEL */
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
   SELLER FINAL DECISION (AFTER RIDER VERIFICATION)
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

    /* 🔒 BUSINESS LOCKS */
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

    /* ✅ APPLY DECISION */
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
   DOWNLOAD INVOICE (USER) ✅ FIXED
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

    // 🔥 REMOVE leading slash from URL
    const relativePath = request.invoice.url.replace(/^\/+/, "");

    // ✅ Resolve from project root
    const filePath = path.resolve(process.cwd(), relativePath);

    if (!fs.existsSync(filePath)) {
      console.error("❌ Invoice file not found at:", filePath);
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
