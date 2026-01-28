import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import SellRequest from "../src/models/SellRequest.js";
import riderAuth from "../middleware/riderAuth.js";
import { sendOtp, verifyOtp } from "../controllers/riderAuth.controller.js";
import { calculateFinalPrice } from "../utils/priceRules.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";

const router = express.Router();

/* ================= MULTER ================= */
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

/* ================= AUTH ================= */
router.post("/auth/send-otp", sendOtp);
router.post("/auth/verify-otp", verifyOtp);

/* ================= PICKUPS LIST ================= */
router.get("/pickups", riderAuth, async (req, res) => {
  const pickups = await SellRequest.find({
    "assignedRider.riderId": req.rider.riderId,
    "pickup.status": { $in: ["Scheduled", "Picked", "Completed"] },
  })
    .sort({ "pickup.scheduledAt": 1 })
    .lean();

  res.json(pickups);
});

/* ================= PICKUP DETAILS ================= */
router.get("/pickups/:id", riderAuth, async (req, res) => {
  const pickup = await SellRequest.findOne({
    _id: req.params.id,
    "assignedRider.riderId": req.rider.riderId,
  }).lean();

  if (!pickup) return res.status(404).json({ message: "Pickup not found" });
  res.json(pickup);
});

/* ================= UPLOAD VERIFICATION IMAGES ================= */
/* 🔥 NO document save() — avoids validation errors */
router.post(
  "/pickups/:id/upload-images",
  riderAuth,
  upload.array("images", 6),
  async (req, res) => {
    if (!req.files?.length) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const images = req.files.map((file) => ({
      url: `/uploads/pickups/${file.filename}`,
      uploadedAt: new Date(),
      uploadedBy: req.rider.riderId,
    }));

    const result = await SellRequest.updateOne(
      {
        _id: req.params.id,
        "assignedRider.riderId": req.rider.riderId,
      },
      {
        $push: {
          "verification.images": { $each: images },
        },
      }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    res.json({ success: true });
  }
);

/* ================= VERIFY DEVICE ================= */
router.put("/pickups/:id/verify", riderAuth, async (req, res) => {
  const { checks = {}, riderNotes = "" } = req.body;

  const pickup = await SellRequest.findOne({
    _id: req.params.id,
    "assignedRider.riderId": req.rider.riderId,
  }).lean();

  if (!pickup) return res.status(404).json({ message: "Pickup not found" });

  if (!["Scheduled", "Picked"].includes(pickup.pickup.status)) {
    return res.status(400).json({ message: "Invalid pickup state" });
  }

  const { deductions, finalPrice } = calculateFinalPrice(
    pickup.pricing.basePrice,
    checks
  );

  await SellRequest.updateOne(
    { _id: pickup._id },
    {
      $set: {
        "verification.checks": checks,
        "verification.deductions": deductions,
        "verification.finalPrice": finalPrice,
        "verification.verifiedAt": new Date(),
        "verification.verifiedBy": req.rider.riderId,
        "verification.riderNotes": riderNotes,
        "pricing.finalPrice": finalPrice,
        "pickup.status": "Picked",
      },
    }
  );

  res.json({ success: true, finalPrice });
});

/* ================= COMPLETE PICKUP + GENERATE INVOICE ================= */
router.put("/pickups/:id/complete", riderAuth, async (req, res) => {
  const request = await SellRequest.findOne({
    _id: req.params.id,
    "assignedRider.riderId": req.rider.riderId,
    "pickup.status": "Picked",
    "verification.images.0": { $exists: true },
    "verification.finalPrice": { $exists: true },
  });

  if (!request) {
    return res.status(400).json({
      message: "Verify device, upload images, and set final price first",
    });
  }

  /* 🔥 GENERATE INVOICE */
  const invoice = await generateInvoice(request);

  request.pickup.status = "Completed";
  request.pickup.completedAt = new Date();
  request.status = "Completed";

  request.invoice = {
    number: invoice.invoiceNumber,
    url: invoice.url,
    generatedAt: new Date(),
  };

  request.statusHistory.push({
    status: "Pickup Completed",
    changedBy: "rider",
  });

  await request.save();

  res.json({
    success: true,
    invoiceUrl: invoice.url,
  });
});


/* ================= RIDER EARNINGS ================= */
router.get("/earnings", riderAuth, async (req, res) => {
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
});

export default router;
