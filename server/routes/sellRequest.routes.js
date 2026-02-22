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
    accountHolderName,
    accountNumber,
    ifscCode,
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
      message: "Missing required phone fields",
    });
  }

  if (!accountHolderName || !accountNumber || !ifscCode) {
    return res.status(400).json({
      message: "Bank details are required",
    });
  }

  if (!/^\d{9,18}$/.test(accountNumber)) {
    return res.status(400).json({
      message: "Invalid account number",
    });
  }

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
    return res.status(400).json({
      message: "Invalid IFSC code",
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

    const masked = requests.map((r) => {
      const obj = r.toObject();
      if (obj.bankDetails?.accountNumber) {
        obj.bankDetails.accountNumber =
          obj.bankDetails.accountNumber.replace(/\d(?=\d{4})/g, "X");
      }
      return obj;
    });

    res.json(masked);
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

    const obj = request.toObject();

    if (obj.bankDetails?.accountNumber) {
      obj.bankDetails.accountNumber =
        obj.bankDetails.accountNumber.replace(/\d(?=\d{4})/g, "X");
    }

    res.json(obj);
  } catch (err) {
    console.error("FETCH SELL REQUEST ERROR:", err);
    res.status(500).json({ message: "Failed to fetch sell request" });
  }
});

/* ======================================================
   USER ACCEPT / REJECT FINAL PRICE
====================================================== */
router.put("/:id/decision", userAuth, async (req, res) => {
  try {
    const { accept } = req.body;

    if (typeof accept !== "boolean") {
      return res.status(400).json({
        message: "Invalid decision",
      });
    }

    const request = await SellRequest.findOne({
      _id: req.params.id,
      "user.uid": req.user.uid,
    });

    if (!request) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    if (request.workflowStatus !== "UNDER_VERIFICATION") {
      return res.status(409).json({
        message: "Decision not allowed at this stage",
      });
    }

    if (!request.verification?.finalPrice) {
      return res.status(409).json({
        message: "Final price not available",
      });
    }

    request.verification.userAccepted = accept;

    if (accept) {
      request.transitionStatus(
        "USER_ACCEPTED",
        "user",
        "User accepted final price"
      );

      request.transitionStatus(
        "COMPLETED",
        "system",
        "Sell process completed"
      );
    } else {
      request.transitionStatus(
        "CANCELLED",
        "user",
        "User rejected final price"
      );
    }

    await request.save();

    return res.json({ success: true });
  } catch (err) {
    console.error("SELLER DECISION ERROR:", err);
    return res.status(500).json({
      message: "Failed to submit decision",
    });
  }
});

/* ======================================================
   EDIT BANK DETAILS
====================================================== */
router.put("/:id/bank-details", userAuth, async (req, res) => {
  try {
    const { accountHolderName, accountNumber, ifscCode } = req.body;

    const request = await SellRequest.findOne({
      _id: req.params.id,
      "user.uid": req.user.uid,
    });

    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    if (request.workflowStatus !== "CREATED") {
      return res.status(409).json({
        message: "Bank details cannot be edited after approval",
      });
    }

    request.bankDetails = {
      accountHolderName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      locked: false,
    };

    await request.save();

    res.json({ success: true });
  } catch (err) {
    console.error("EDIT BANK DETAILS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
