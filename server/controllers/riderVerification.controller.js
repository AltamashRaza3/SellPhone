import SellRequest from "../models/SellRequest.js";
import { calculateFinalPrice } from "../utils/priceRules.js";
import { notifyUser } from "../services/notification.service.js";

/**
 * RIDER VERIFY DEVICE
 * ===================
 * - Rider verifies physical condition
 * - System calculates final price
 * - Rider NEVER enters price
 * - Pickup must be Scheduled
 * - Admin must be Approved
 * - User notified after verification
 */
export const verifyDevice = async (req, res) => {
  try {
    const sellRequestId = req.params.id;
    const { checks } = req.body;

    /* ================= BASIC VALIDATION ================= */
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

    /* ================= ADMIN APPROVAL CHECK ================= */
    if (sellRequest.admin?.status !== "Approved") {
      return res.status(409).json({
        message: "Admin approval required before verification",
      });
    }

    /* ================= PICKUP STATUS CHECK ================= */
    if (sellRequest.pickup?.status !== "Scheduled") {
      return res.status(409).json({
        message: "Pickup must be scheduled before verification",
      });
    }

    /* ================= RIDER OWNERSHIP CHECK ================= */
    if (
      sellRequest.assignedRider?.riderId?.toString() !==
      req.rider.riderId
    ) {
      return res.status(403).json({
        message: "You are not assigned to this pickup",
      });
    }

    /* ================= DUPLICATE VERIFICATION CHECK ================= */
    if (sellRequest.verification?.verifiedAt) {
      return res.status(409).json({
        message: "Device already verified",
      });
    }

    /* ================= MINIMUM 3 IMAGE RULE ================= */
    const images = sellRequest.verification?.images || [];
    if (images.length < 3) {
      return res.status(400).json({
        message: "Minimum 3 verification images required",
      });
    }

    /* ================= CHECKLIST LOGIC ================= */
    const values = Object.values(checks);
    const allChecked = values.every(Boolean);
    const allUnchecked = values.every(v => !v);

    /* AUTO REJECT IF ALL FAILED */
    if (allUnchecked) {
      sellRequest.pickup.status = "Rejected";
      sellRequest.pickup.rejectReason =
        "Device failed all verification checks";

      sellRequest.statusHistory.push({
        status: "Auto Rejected",
        changedBy: "system",
        note: "All verification checks failed",
        changedAt: new Date(),
      });

      await sellRequest.save();

      await createAdminAlert({
        sellRequestId: sellRequest._id,
        message: "Device auto-rejected (all checks failed)",
      });

      return res.status(400).json({
        message: "Device auto-rejected due to failed checks",
      });
    }

    /* IF PARTIAL FAILURE → FORCE RIDER TO REJECT */
    if (!allChecked) {
      return res.status(400).json({
        message:
          "All checklist items must be confirmed. Reject if condition fails.",
      });
    }

    /* ================= BASE PRICE CHECK ================= */
    const basePrice = sellRequest.pricing?.basePrice;
    if (typeof basePrice !== "number") {
      return res.status(500).json({
        message: "Base price missing",
      });
    }

    /* ================= FINAL PRICE CALCULATION ================= */
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

    sellRequest.statusHistory.push({
      status: "Device Verified",
      changedBy: "rider",
      note: `Final price calculated: ₹${finalPrice}`,
      changedAt: new Date(),
    });

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
      message: "Failed to verify device",
    });
  }
};

