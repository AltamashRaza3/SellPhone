import express from "express";
import mongoose from "mongoose";
import adminAuth from "../middleware/adminAuth.js";
import SellRequest from "../src/models/SellRequest.js";
import Rider from "../models/Rider.js";

const router = express.Router();

/* ======================================================
   GLOBAL CONSTANTS
====================================================== */

const BANK_FEATURE_RELEASE_DATE = new Date("2026-02-20");

/* ======================================================
   GET ALL SELL REQUESTS
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
   ADMIN APPROVE / REJECT
====================================================== */
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status, remarks = "" } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Admin status must be Approved or Rejected",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    if (request.workflowStatus !== "CREATED") {
      return res.status(409).json({
        message: "Admin decision already taken",
      });
    }

    /* ================= BANK VALIDATION (LEGACY SAFE) ================= */

    const hasBankDetails = request.bankDetails?.accountNumber;
    const isLegacyOrder =
      !hasBankDetails && request.createdAt < BANK_FEATURE_RELEASE_DATE;

    if (!hasBankDetails && !isLegacyOrder) {
      return res.status(400).json({
        message: "Bank details missing. Cannot approve.",
      });
    }

    if (request.payout?.status === "Paid") {
      return res.status(409).json({
        message: "Cannot modify request after payout processed",
      });
    }

    /* ================= APPLY DECISION ================= */

    request.admin.status = status;
    request.admin.remarks = remarks;
    request.admin.approvedAt =
      status === "Approved" ? new Date() : null;

    if (status === "Approved") {
      if (request.bankDetails) {
        request.bankDetails.locked = true;
      }

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

    return res.json({ success: true });

  } catch (err) {
    console.error("ADMIN STATUS ERROR:", err);
    return res.status(500).json({
      message: err.message || "Failed to update status",
    });
  }
});

/* ======================================================
   ASSIGN / REASSIGN RIDER
====================================================== */
router.put("/:id/assign-rider", adminAuth, async (req, res) => {
  try {
    const { riderId, scheduledAt } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(riderId)) {
      return res.status(400).json({ message: "Invalid rider ID" });
    }

    if (!scheduledAt) {
      return res.status(400).json({
        message: "Pickup date & time required",
      });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime()) || scheduledDate < new Date()) {
      return res.status(400).json({
        message: "Invalid scheduled date",
      });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    const allowedStates = [
      "ADMIN_APPROVED",
      "ASSIGNED_TO_RIDER",
      "REJECTED_BY_RIDER",
    ];

    if (!allowedStates.includes(request.workflowStatus)) {
      return res.status(409).json({
        message:
          "Rider can only be assigned before verification begins",
      });
    }

    const rider = await Rider.findById(riderId);
    if (!rider || rider.status !== "active") {
      return res.status(404).json({
        message: "Rider not available",
      });
    }

    const previousRider = request.assignedRider?.riderName || null;
    const isReassignment = Boolean(request.assignedRider?.riderId);

    request.assignedRider = {
      riderId: rider._id,
      riderName: rider.name,
      riderPhone: rider.phone,
      assignedAt: new Date(),
    };

    request.pickup.status = "Scheduled";
    request.pickup.scheduledAt = scheduledDate;

    if (request.workflowStatus !== "ASSIGNED_TO_RIDER") {
      request.transitionStatus(
        "ASSIGNED_TO_RIDER",
        "admin",
        isReassignment
          ? `Rider reassigned from ${previousRider} to ${rider.name}`
          : `Rider assigned to ${rider.name}`
      );
    } else {
      request.statusHistory.push({
        status: "Rider Reassigned",
        changedBy: "admin",
        note: `Rider reassigned from ${previousRider} to ${rider.name}`,
        changedAt: new Date(),
      });
    }

    await request.save();

    res.json({
      success: true,
      reassigned: isReassignment,
    });

  } catch (err) {
    console.error("ASSIGN RIDER ERROR:", err);
    res.status(500).json({
      message: err.message || "Failed to assign rider",
    });
  }
});

/* ======================================================
   MARK SELLER PAYOUT AS PAID
====================================================== */
router.put("/:id/payout", adminAuth, async (req, res) => {
  try {
    const { transactionReference } = req.body;

    if (!transactionReference?.trim()) {
      return res.status(400).json({
        message: "Transaction reference required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid request ID",
      });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    if (request.workflowStatus !== "COMPLETED") {
      return res.status(409).json({
        message: "Cannot payout before completion",
      });
    }

    if (!request.verification?.finalPrice) {
      return res.status(409).json({
        message: "Final price missing",
      });
    }

    if (request.verification.userAccepted !== true) {
      return res.status(409).json({
        message: "User has not accepted final price",
      });
    }

    if (request.payout?.status === "Paid") {
      return res.status(409).json({
        message: "Seller already paid",
      });
    }

    /* ================= BANK VALIDATION ================= */

    const hasBankDetails = request.bankDetails?.accountNumber;
    const isLegacyOrder =
      !hasBankDetails && request.createdAt < BANK_FEATURE_RELEASE_DATE;

    if (!hasBankDetails && !isLegacyOrder) {
      return res.status(400).json({
        message: "Bank details missing",
      });
    }

    /* ================= PROCESS PAYOUT ================= */

    if (!request.payout) {
      request.payout = {};
    }

    request.payout.status = "Paid";
    request.payout.paidAt = new Date();
    request.payout.transactionReference = transactionReference.trim();

    request.statusHistory.push({
      status: "SELLER_PAID",
      changedBy: "admin",
      note: `Seller paid. Ref: ${transactionReference.trim()}`,
      changedAt: new Date(),
    });

    await request.save();

    return res.json({
      success: true,
      message: "Seller marked as paid successfully",
    });

  } catch (err) {
    console.error("SELLER PAYOUT ERROR:", err);
    return res.status(500).json({
      message: err.message || "Failed to process payout",
    });
  }
});

export default router;
