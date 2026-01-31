import SellRequest from "../models/SellRequest.js";

/**
 * RIDER COMPLETE PICKUP
 * ====================
 * - Rider can complete pickup ONLY after:
 *   1. Device verified (Picked)
 *   2. User accepted final price
 * - Prevents invalid lifecycle jumps
 */
export const completePickup = async (req, res) => {
  try {
    const sellRequest = await SellRequest.findById(req.params.id);
    if (!sellRequest) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    /* ================= RIDER OWNERSHIP ================= */
    if (
      sellRequest.assignedRider?.riderId?.toString() !==
      req.rider.riderId.toString()
    ) {
      return res.status(403).json({
        message: "You are not assigned to this pickup",
      });
    }

    /* ================= STATE GUARD ================= */
    if (sellRequest.pickup.status !== "Picked") {
      return res.status(400).json({
        message: "Pickup must be picked before completion",
      });
    }

    /* ================= USER ACCEPTANCE ================= */
    if (sellRequest.verification.userAccepted !== true) {
      return res.status(400).json({
        message: "User must accept final price before completing pickup",
      });
    }

    /* ================= DUPLICATE PROTECTION ================= */
    if (sellRequest.pickup.status === "Completed") {
      return res.status(409).json({
        message: "Pickup already completed",
      });
    }

    /* ================= COMPLETE ================= */
    sellRequest.pickup.status = "Completed";
    sellRequest.pickup.completedAt = new Date();

    sellRequest.statusHistory.push({
      status: "Pickup Completed",
      changedBy: "rider",
      note: "Pickup completed after verification and user acceptance",
      changedAt: new Date(),
    });

    await sellRequest.save();

    return res.json({
      success: true,
      message: "Pickup completed successfully",
    });
  } catch (error) {
    console.error("COMPLETE PICKUP ERROR:", error);
    return res.status(500).json({
      message: "Failed to complete pickup",
    });
  }
};
