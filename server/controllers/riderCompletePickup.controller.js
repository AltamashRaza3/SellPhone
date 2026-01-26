import SellRequest from "../models/SellRequest.js";

/**
 * RIDER COMPLETE PICKUP
 * ====================
 * - Rider can complete pickup ONLY after user accepts final price
 * - Prevents premature completion
 * - Enforces full business lifecycle
 */
export const completePickup = async (req, res) => {
  try {
    const sellRequestId = req.params.id;

    const sellRequest = await SellRequest.findById(sellRequestId);
    if (!sellRequest) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    /* ================= RIDER OWNERSHIP CHECK ================= */
    if (
      sellRequest.assignedRider?.riderId !==
      req.rider.riderId
    ) {
      return res.status(403).json({
        message:
          "You are not assigned to this pickup",
      });
    }

    /* ================= USER ACCEPTANCE CHECK ================= */
    if (
      sellRequest.verification?.userAccepted !== true
    ) {
      return res.status(400).json({
        message:
          "User must accept final price before completing pickup",
      });
    }

    /* ================= DUPLICATE COMPLETION CHECK ================= */
    if (sellRequest.pickup?.status === "Completed") {
      return res.status(400).json({
        message: "Pickup already completed",
      });
    }

    /* ================= COMPLETE PICKUP ================= */
    sellRequest.pickup.status = "Completed";
    sellRequest.pickup.completedAt = new Date();

    sellRequest.statusHistory.push({
      status: "Pickup Completed",
      changedBy: "rider",
      note: "Pickup completed after user acceptance",
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
