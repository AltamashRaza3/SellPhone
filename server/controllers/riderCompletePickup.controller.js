import SellRequest from "../models/SellRequest.js";

/**
 * RIDER COMPLETE PICKUP
 * =====================
 * Production-safe lifecycle control
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

    /* ================= WORKFLOW STATE GUARD ================= */
    if (sellRequest.workflowStatus !== "USER_ACCEPTED") {
      return res.status(400).json({
        message:
          "Pickup cannot be completed unless user has accepted the final price",
      });
    }

    /* ================= DUPLICATE PROTECTION ================= */
    if (sellRequest.workflowStatus === "COMPLETED") {
      return res.status(409).json({
        message: "Pickup already completed",
      });
    }

    /* ================= COMPLETE PICKUP ================= */
    sellRequest.pickup.status = "Completed";
    sellRequest.pickup.completedAt = new Date();

    // 🔥 CRITICAL FIX — Update master workflow
    sellRequest.transitionStatus(
      "COMPLETED",
      "rider",
      "Pickup completed after verification and user acceptance"
    );

    await sellRequest.save();

    return res.json({
      success: true,
      message: "Pickup completed successfully",
    });
  } catch (error) {
    console.error("COMPLETE PICKUP ERROR:", error);
    return res.status(500).json({
      message: error.message || "Failed to complete pickup",
    });
  }
};
