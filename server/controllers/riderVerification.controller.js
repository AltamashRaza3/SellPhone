import SellRequest from "../models/SellRequest.js";
import { calculateFinalPrice } from "../utils/priceRules.js";
import { notifyUser } from "../services/notification.service.js";

/**
 * RIDER VERIFY DEVICE
 * ===================
 * Production-safe verification lifecycle
 */
export const verifyDevice = async (req, res) => {
  try {
    const sellRequestId = req.params.id;
    const { checks } = req.body;

    if (!checks || typeof checks !== "object") {
      return res.status(400).json({
        message: "Verification checks are required",
      });
    }

    const sellRequest = await SellRequest.findById(sellRequestId);
    if (!sellRequest) {
      return res.status(404).json({
        message: "Sell request not found",
      });
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

    /* ================= WORKFLOW GUARD ================= */
    if (sellRequest.workflowStatus !== "ASSIGNED_TO_RIDER") {
      return res.status(409).json({
        message: "Invalid lifecycle state for verification",
      });
    }

    /* ================= IMAGE RULE ================= */
    const images = sellRequest.verification?.images || [];
    if (images.length < 3) {
      return res.status(400).json({
        message: "Minimum 3 verification images required",
      });
    }

    const values = Object.values(checks);
    const allChecked = values.every(Boolean);
    const allUnchecked = values.every(v => !v);

    /* ======================================================
       AUTO REJECT (ALL FAILED)
       ====================================================== */
    if (allUnchecked) {

      sellRequest.pickup.status = "Rejected";
      sellRequest.pickup.rejectedReason =
        "Device failed all verification checks";

      // 🔥 CRITICAL FIX
      sellRequest.transitionStatus(
        "REJECTED_BY_RIDER",
        "rider",
        "Device auto-rejected due to all checks failing"
      );

      await sellRequest.save();

      return res.status(400).json({
        message: "Device auto-rejected due to failed checks",
      });
    }

    /* ======================================================
       PARTIAL FAILURE → FORCE MANUAL REJECTION
       ====================================================== */
    if (!allChecked) {
      return res.status(400).json({
        message:
          "All checklist items must pass. Reject if condition fails.",
      });
    }

    /* ================= PRICE CALCULATION ================= */
    const basePrice = sellRequest.pricing?.basePrice;
    if (typeof basePrice !== "number") {
      return res.status(500).json({
        message: "Base price missing",
      });
    }

    const {
      deductions,
      totalDeduction,
      finalPrice,
    } = calculateFinalPrice(basePrice, checks);

    /* ================= SAVE VERIFICATION ================= */
    sellRequest.verification = {
      ...sellRequest.verification,
      checks,
      deductions,
      totalDeduction,
      finalPrice,
      verifiedBy: req.rider.riderId,
      verifiedAt: new Date(),
      userAccepted: null,
    };

    sellRequest.pickup.status = "Picked";

    // 🔥 CRITICAL FIX
    sellRequest.transitionStatus(
      "UNDER_VERIFICATION",
      "rider",
      `Device verified. Final price ₹${finalPrice}`
    );

    await sellRequest.save();

    /* ================= USER NOTIFICATION ================= */
    notifyUser({
      user: sellRequest.user,
      type: "FINAL_PRICE_READY",
      payload: { finalPrice },
    }).catch((err) => {
      console.error("NOTIFICATION ERROR:", err);
    });

    return res.json({
      success: true,
      message: "Device verified successfully",
      basePrice,
      finalPrice,
      deductions,
    });

  } catch (error) {
    console.error("RIDER VERIFY ERROR:", error);
    return res.status(500).json({
      message: error.message || "Failed to verify device",
    });
  }
};

