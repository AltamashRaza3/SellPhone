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
    const requests = await SellRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch {
    res.status(500).json({ message: "Failed to fetch sell requests" });
  }
});

/* ======================================================
   UPDATE ADMIN STATUS
====================================================== */
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { status, remarks = "" } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid admin status" });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    // 🔒 Ensure admin object exists
    if (!request.admin) {
      request.admin = {};
    }

    // 🔒 Cannot change status after rider assignment
    if (request.assignedRider?.riderId) {
      return res.status(409).json({
        message: "Cannot change status after rider assignment",
      });
    }

    request.admin.status = status;
    request.admin.remarks = remarks;
    request.admin.approvedAt = status === "Approved" ? new Date() : null;

    request.statusHistory.push({
      status: `Admin ${status}`,
      changedBy: "admin",
      note: remarks || `Marked as ${status}`,
    });

    await request.save();
    res.json(request);
  } catch (err) {
    console.error("ADMIN STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update status" });
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

    // 🔒 Only allow assignment AFTER admin approval
    if (request.admin?.status !== "Approved") {
      return res.status(409).json({
        message: "Admin approval required before assigning rider",
      });
    }

    const rider = await Rider.findById(riderId);
    if (!rider || rider.status !== "active") {
      return res.status(404).json({ message: "Rider not available" });
    }

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
      status: "Scheduled",
      changedBy: "admin",
      note: `Assigned to ${rider.name}`,
    });

    await request.save();

    res.json({ success: true });
  } catch (err) {
    console.error("ASSIGN RIDER ERROR:", err);
    res.status(500).json({ message: "Failed to assign rider" });
  }
});

export default router;
