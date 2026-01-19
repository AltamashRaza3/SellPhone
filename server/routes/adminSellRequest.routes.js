import express from "express";
import SellRequest from "../models/SellRequest.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* ================= FETCH ALL SELL REQUESTS ================= */
router.get("/", adminAuth, async (req, res) => {
  try {
    const requests = await SellRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch {
    res.status(500).json({ message: "Failed to fetch sell requests" });
  }
});

/* ================= SCHEDULE PICKUP (PHASE 20.4) ================= */
router.put("/:id/schedule-pickup", adminAuth, async (req, res) => {
  try {
    const { scheduledAt, rider } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ message: "Pickup date required" });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    request.pickup.status = "Scheduled";
    request.pickup.scheduledAt = scheduledAt;
    request.pickup.rider = rider || {};

    request.status = "Pickup Scheduled";

    request.statusHistory.push({
      status: "Pickup Scheduled",
      changedBy: req.admin._id,
      note: "Pickup scheduled by admin",
    });

    await request.save();
    res.json(request);
  } catch (err) {
    console.error("SCHEDULE PICKUP ERROR:", err);
    res.status(500).json({ message: "Failed to schedule pickup" });
  }
});

export default router;
