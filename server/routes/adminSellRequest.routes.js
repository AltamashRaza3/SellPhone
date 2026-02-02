import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import SellRequest from "../src/models/SellRequest.js";
import Rider from "../models/Rider.js";

const router = express.Router();

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
    console.error("FETCH ADMIN SELL REQUESTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch sell requests" });
  }
});

/* ======================================================
   UPDATE ADMIN STATUS (ONE-TIME DECISION)
====================================================== */
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status, remarks = "" } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Admin status must be Approved or Rejected",
      });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    /* 🔒 LOCK ONLY AFTER FINAL DECISION */
if (["Approved", "Rejected"].includes(request.admin?.status)) {
  return res.status(409).json({
    message: "Admin decision already made",
  });
}

    /* 🔒 NO CHANGE AFTER RIDER ASSIGNMENT */
    if (request.assignedRider?.riderId) {
      return res.status(409).json({
        message: "Cannot change admin status after rider assignment",
      });
    }

    request.admin = {
      status,
      remarks,
      approvedAt: status === "Approved" ? new Date() : null,
    };

    request.statusHistory.push({
      status: `Admin ${status}`,
      changedBy: "admin",
      note: remarks || `Marked as ${status}`,
      changedAt: new Date(),
    });

    await request.save();

    res.json({
      success: true,
      status,
    });
  } catch (err) {
    console.error("ADMIN STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update admin status" });
  }
});

/* ======================================================
   ASSIGN / REASSIGN RIDER (ADMIN)
   Allowed until verification (before Picked)
====================================================== */
router.put("/:id/assign-rider", adminAuth, async (req, res) => {
  try {
    const { riderId, scheduledAt } = req.body;

    if (!riderId) {
      return res.status(400).json({ message: "Rider ID required" });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    /* 🔒 Admin must approve first */
if (request.admin?.status !== "Approved") {
  return res.status(409).json({
    message: "Admin approval required before assigning rider",
  });
}



    /* 🔒 HARD LOCK AFTER VERIFICATION */
    if (
      request.pickup.status === "Picked" ||
      request.pickup.status === "Completed" ||
      request.verification?.finalPrice != null
    ) {
      return res.status(409).json({
        message: "Cannot reassign rider after device verification",
      });
    }

    const rider = await Rider.findById(riderId);
    if (!rider || rider.status !== "active") {
      return res.status(404).json({ message: "Rider not available" });
    }

    const isReassignment = Boolean(request.assignedRider?.riderId);

    request.assignedRider = {
      riderId: rider._id.toString(),
      riderName: rider.name,
      riderPhone: rider.phone,
      assignedAt: new Date(),
    };

    request.pickup.status = "Scheduled";
    request.pickup.scheduledAt = scheduledAt
      ? new Date(scheduledAt)
      : new Date();

    request.statusHistory.push({
      status: isReassignment ? "Rider Reassigned" : "Rider Assigned",
      changedBy: "admin",
      note: `Assigned to ${rider.name}`,
      changedAt: new Date(),
    });

    await request.save();

    res.json({
      success: true,
      reassigned: isReassignment,
    });
  } catch (err) {
    console.error("ASSIGN / REASSIGN RIDER ERROR:", err);
    res.status(500).json({ message: "Failed to assign rider" });
  }
});


export default router;
