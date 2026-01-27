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
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("ADMIN FETCH ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch sell requests",
    });
  }
});

/* ======================================================
   APPROVE / REJECT / IN REVIEW SELL REQUEST
   PUT /api/admin/sell-requests/:id
====================================================== */
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!["Approved", "Rejected", "In Review"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    /* ================= SAFE INIT ================= */
    request.admin = request.admin || {};
    request.statusHistory = request.statusHistory || [];

    /* ================= ADMIN UPDATE ================= */
    request.admin.status = status;
    request.admin.remarks = remarks || "";
    request.admin.approvedAt =
      status === "Approved" ? new Date() : null;

    request.statusHistory.push({
      status: `Admin ${status}`,
      changedBy: "admin",
      note: remarks || `Marked as ${status}`,
      changedAt: new Date(),
    });

    await request.save({ validateBeforeSave: false });
    res.json(request);
  } catch (err) {
    console.error("ADMIN STATUS UPDATE ERROR:", err);
    res.status(500).json({
      message: "Failed to update status",
    });
  }
});

/* ======================================================
   ASSIGN RIDER (ADMIN)
   PUT /api/admin/sell-requests/:id/assign-rider
====================================================== */
router.put("/:id/assign-rider", adminAuth, async (req, res) => {
  try {
    const { riderId } = req.body;

    if (!riderId) {
      return res.status(400).json({
        message: "Rider ID required",
      });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    if (request.admin?.status !== "Approved") {
      return res.status(409).json({
        message: "Admin approval required before assigning rider",
      });
    }

    if (request.assignedRider?.riderId) {
      return res.status(409).json({
        message: "Rider already assigned",
      });
    }

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    /* ================= SAFE INIT ================= */
    request.pickup = request.pickup || {};
    request.statusHistory = request.statusHistory || [];

    /* ================= ASSIGN ================= */
    request.assignedRider = {
      riderId: rider._id.toString(),
      riderName: rider.name,
      assignedAt: new Date(),
    };

    request.pickup.status = "Scheduled";
    request.pickup.scheduledAt = new Date();

    request.statusHistory.push({
      status: "Pickup Scheduled",
      changedBy: "admin",
      note: `Assigned to rider ${rider.name}`,
      changedAt: new Date(),
    });

    await request.save({ validateBeforeSave: false });
    res.json(request);
  } catch (err) {
    console.error("ASSIGN RIDER ERROR:", err);
    res.status(500).json({
      message: "Failed to assign rider",
    });
  }
});

export default router;
