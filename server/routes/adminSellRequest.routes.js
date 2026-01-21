import express from "express";
import SellRequest from "../models/SellRequest.js";
import Rider from "../models/Rider.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* ======================================================
   CONSTANTS
====================================================== */
const ALLOWED_STATUS = [
  "Pending",
  "In Review",
  "Approved",
  "Rejected",
];

/* ======================================================
   GET ALL SELL REQUESTS (ADMIN)
====================================================== */
router.get("/", adminAuth, async (req, res) => {
  try {
    const requests = await SellRequest.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(requests);
  } catch (err) {
    console.error("ADMIN FETCH SELL REQUESTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch sell requests" });
  }
});

/* ======================================================
   GET SINGLE SELL REQUEST TIMELINE (ADMIN)
====================================================== */
router.get("/:id/timeline", adminAuth, async (req, res) => {
  try {
    const request = await SellRequest.findById(req.params.id).lean();

    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    res.json({
      id: request._id,
      status: request.status,
      pickup: request.pickup || null,
      assignedRider: request.assignedRider || null,
      history: request.history || [],
      verification: request.verification || {},
      createdAt: request.createdAt,
    });
  } catch (err) {
    console.error("ADMIN FETCH TIMELINE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch timeline" });
  }
});

/* ======================================================
   ASSIGN RIDER (ADMIN)
====================================================== */
router.put("/:id/assign-rider", adminAuth, async (req, res) => {
  try {
    const { riderId, scheduledAt } = req.body;

    if (!riderId || !scheduledAt) {
      return res.status(400).json({
        message: "Rider and pickup time required",
      });
    }

    const pickupTime = new Date(scheduledAt);
    if (isNaN(pickupTime.getTime())) {
      return res.status(400).json({ message: "Invalid pickup time" });
    }

    const rider = await Rider.findById(riderId);
    if (!rider || rider.status !== "active") {
      return res.status(404).json({ message: "Rider not found" });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    if (request.status !== "In Review") {
      return res.status(400).json({
        message: "Pickup can only be scheduled after review",
      });
    }

    /* ================= SAFE PICKUP INIT ================= */
    if (!request.pickup) {
      request.pickup = {
        status: "Scheduled",
        scheduledAt: pickupTime,
        address: {
          line1: "",
          city: "",
          state: "",
          pincode: "",
        },
      };
    } else {
      request.pickup.status = "Scheduled";
      request.pickup.scheduledAt = pickupTime;
    }

    request.assignedRider = {
      riderId: rider._id,
      name: rider.name,
      phone: rider.phone,
    };

    request.history.push({
      action: "Pickup Scheduled",
      by: req.admin._id.toString(),
      note: `Pickup assigned to ${rider.name}`,
      at: new Date(),
    });

    await request.save();

    res.json(request);
  } catch (err) {
    console.error("ASSIGN RIDER ERROR:", err);
    res.status(500).json({ message: "Failed to assign rider" });
  }
});

/* ======================================================
   UPDATE STATUS (ADMIN)
====================================================== */
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    request.status = status;
    request.adminNotes = note || "";

    request.history.push({
      action: "Status Updated",
      by: req.admin._id.toString(),
      note: note || `Marked as ${status}`,
      at: new Date(),
    });

    await request.save();

    res.json(request);
  } catch (err) {
    console.error("ADMIN UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

export default router;
