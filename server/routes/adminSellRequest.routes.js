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
   ADMIN APPROVE / REJECT SELL REQUEST
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

    if (["Approved", "Rejected"].includes(request.admin?.status)) {
      return res.status(409).json({
        message: "Admin decision already made",
      });
    }

    if (request.assignedRider?.riderId) {
      return res.status(409).json({
        message: "Cannot change admin status after rider assignment",
      });
    }

    /* ================= ADMIN DECISION ================= */
    request.admin.status = status;
    request.admin.remarks = remarks;
    request.admin.approvedAt =
      status === "Approved" ? new Date() : null;

    // 🔥 CRITICAL FIX — Transition lifecycle
    if (status === "Approved") {
      request.transitionStatus(
        "ADMIN_APPROVED",
        "admin",
        remarks || "Admin approved sell request"
      );
    } else {
      request.transitionStatus(
        "CANCELLED",
        "admin",
        remarks || "Admin rejected sell request"
      );
    }

    await request.save();

    res.json({
      success: true,
      status,
    });
  } catch (err) {
    console.error("ADMIN STATUS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ======================================================
   ASSIGN / REASSIGN RIDER (ADMIN)
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

    if (request.workflowStatus !== "ADMIN_APPROVED") {
      return res.status(409).json({
        message: "Admin approval required before assigning rider",
      });
    }

    if (
      ["UNDER_VERIFICATION", "USER_ACCEPTED", "COMPLETED"].includes(
        request.workflowStatus
      )
    ) {
      return res.status(409).json({
        message: "Cannot reassign rider after verification",
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

    // 🔥 CRITICAL FIX
    request.transitionStatus(
      "ASSIGNED_TO_RIDER",
      "admin",
      isReassignment
        ? `Rider reassigned to ${rider.name}`
        : `Rider assigned to ${rider.name}`
    );

    await request.save();

    res.json({
      success: true,
      reassigned: isReassignment,
    });

  } catch (err) {
    console.error("ASSIGN RIDER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
