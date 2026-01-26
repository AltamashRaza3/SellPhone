import SellRequest from "../models/SellRequest.js";

/**
 * USER ACCEPT / REJECT FINAL PRICE
 * ===============================
 * - User decides on final price after rider verification
 * - Accept → pickup completed
 * - Reject → pickup rejected
 */
export const decideFinalPrice = async (req, res) => {
  try {
    const sellRequestId = req.params.id;
    const { decision } = req.body; // "accept" | "reject"

    if (!["accept", "reject"].includes(decision)) {
      return res.status(400).json({
        message: "Decision must be accept or reject",
      });
    }

    const sellRequest = await SellRequest.findById(sellRequestId);
    if (!sellRequest) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    /* ================= USER OWNERSHIP CHECK ================= */
    if (sellRequest.user.uid !== req.user.uid) {
      return res.status(403).json({
        message: "Not authorized to act on this request",
      });
    }

    /* ================= VERIFICATION REQUIRED ================= */
    if (!sellRequest.verification?.verifiedAt) {
      return res.status(409).json({
        message: "Device not verified yet",
      });
    }

    /* ================= DUPLICATE DECISION GUARD ================= */
    if (sellRequest.verification.userAccepted !== null) {
      return res.status(409).json({
        message: "Decision already submitted",
      });
    }

    /* ================= APPLY DECISION ================= */
    const accepted = decision === "accept";

    sellRequest.verification.userAccepted = accepted;

    if (accepted) {
      sellRequest.pickup.status = "Completed";
      sellRequest.pickup.completedAt = new Date();

      sellRequest.statusHistory.push({
        status: "User Accepted Final Price",
        changedBy: "user",
        note: `Accepted final price ₹${sellRequest.verification.finalPrice}`,
        changedAt: new Date(),
      });
    } else {
      sellRequest.pickup.status = "Rejected";

      sellRequest.statusHistory.push({
        status: "User Rejected Final Price",
        changedBy: "user",
        note: `Rejected final price ₹${sellRequest.verification.finalPrice}`,
        changedAt: new Date(),
      });
    }

    await sellRequest.save();

    return res.json({
      success: true,
      decision,
      finalPrice: sellRequest.verification.finalPrice,
    });
  } catch (error) {
    console.error("USER DECISION ERROR:", error);
    return res.status(500).json({
      message: "Failed to submit decision",
    });
  }
};
