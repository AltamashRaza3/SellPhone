import SellRequest from "../src/models/SellRequest.js";
import Rider from "../models/Rider.js";
import { calculateBasePrice } from "../utils/priceRules.js";

/* ======================================================
   CREATE SELL REQUEST (USER)
====================================================== */
export const createSellRequest = async (req, res) => {
  try {
    if (!req.files || req.files.length < 3) {
      return res.status(400).json({
        message: "At least 3 phone images are required",
      });
    }

    if (!req.user?.uid || !req.user?.email) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const {
      brand,
      model,
      storage,
      ram,
      color,
      declaredCondition,
      purchaseYear,
      phone,
      fullAddress,
      city,
      state,
      pincode,
    } = req.body;

    const year = Number(purchaseYear);
    if (Number.isNaN(year)) {
      return res.status(400).json({
        message: "Invalid purchase year",
      });
    }

    const images = req.files.map(
      (file) => `/uploads/sell/${file.filename}`
    );

    const catalog = {
      baseMarketPrice: 22000,
      depreciationPerYear: 0.12,
      maxDepreciation: 0.6,
    };

    const basePrice = calculateBasePrice({
      catalog,
      purchaseYear: year,
      declaredCondition,
    });

    const sellRequest = new SellRequest({
      user: {
        uid: req.user.uid,
        email: req.user.email,
      },
      contact: {
        phone,
        email: req.user.email,
      },
      phone: {
        brand,
        model,
        storage,
        ram,
        color,
        declaredCondition,
        purchaseYear: year,
        images,
      },
      pricing: { basePrice },
      pickup: {
        status: "Pending",
        address: {
          line1: fullAddress,
          city,
          state,
          pincode,
        },
      },
    });

    // ✅ DO NOT call transitionStatus("CREATED")
    // Just log history
    sellRequest.statusHistory.push({
      status: "CREATED",
      changedBy: "user",
      note: "Sell request submitted",
      changedAt: new Date(),
    });

    await sellRequest.save();

    return res.status(201).json({
      success: true,
      message: "Sell request created successfully",
      data: sellRequest,
    });

  } catch (error) {
    console.error("CREATE SELL REQUEST ERROR:", error);
    return res.status(500).json({
      message: "Failed to create sell request",
    });
  }
};


/* ======================================================
   ASSIGN RIDER (ADMIN)
====================================================== */
export const assignRider = async (req, res) => {
  try {
    const { riderId, scheduledAt } = req.body;

    const sellRequest = await SellRequest.findById(req.params.id);
    if (!sellRequest) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    // 🔥 Use workflow guard, not pickup guard
    if (sellRequest.workflowStatus !== "ADMIN_APPROVED") {
      return res.status(409).json({
        message: "Sell request must be admin approved first",
      });
    }

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    sellRequest.assignedRider = {
      riderId: rider._id,
      riderName: rider.name,
      riderPhone: rider.phone,
      assignedAt: new Date(),
    };

    sellRequest.pickup.status = "Scheduled";
    sellRequest.pickup.scheduledAt = scheduledAt
      ? new Date(scheduledAt)
      : new Date();

    // 🔥 Proper lifecycle transition
    sellRequest.transitionStatus(
      "ASSIGNED_TO_RIDER",
      "admin",
      "Rider assigned and pickup scheduled"
    );

    await sellRequest.save();

    return res.json({
      success: true,
      message: "Rider assigned successfully",
    });

  } catch (error) {
    console.error("ASSIGN RIDER ERROR:", error);
    return res.status(500).json({
      message: "Failed to assign rider",
    });
  }
};

/* ======================================================
   USER ACCEPT FINAL PRICE
====================================================== */
export const acceptFinalPrice = async (req, res) => {
  try {
    const sellRequest = await SellRequest.findOne({
      _id: req.params.id,
      "user.uid": req.user.uid,
    });

    if (!sellRequest) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    if (sellRequest.workflowStatus !== "UNDER_VERIFICATION") {
      return res.status(409).json({
        message: "Invalid lifecycle state",
      });
    }

    if (!sellRequest.verification?.finalPrice) {
      return res.status(409).json({
        message: "Final price not set yet",
      });
    }

    sellRequest.verification.userAccepted = true;

    // 🔥 Proper lifecycle transition
    sellRequest.transitionStatus(
      "USER_ACCEPTED",
      "user",
      "User accepted final price"
    );

    await sellRequest.save();

    res.json({ success: true });

  } catch (err) {
    console.error("ACCEPT FINAL PRICE ERROR:", err);
    res.status(500).json({ message: "Failed to accept price" });
  }
};
