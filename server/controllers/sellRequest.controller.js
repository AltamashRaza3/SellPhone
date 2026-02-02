import SellRequest from "../src/models/SellRequest.js";
import Rider from "../models/Rider.js";
import { calculateBasePrice } from "../utils/priceRules.js";

/* ======================================================
   CREATE SELL REQUEST (USER)
====================================================== */
export const createSellRequest = async (req, res) => {
  try {
    /* ================= IMAGE VALIDATION ================= */
    if (!req.files || req.files.length < 3) {
      return res.status(400).json({
        message: "At least 3 phone images are required",
      });
    }

    /* ================= BODY ================= */
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

    /* ================= REQUIRED FIELD CHECK ================= */
    if (
      !brand ||
      !model ||
      !storage ||
      !ram ||
      !color ||
      !declaredCondition ||
      !purchaseYear ||
      !phone ||
      !fullAddress ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        message: "Missing required sell request fields",
      });
    }

    const year = Number(purchaseYear);
    if (Number.isNaN(year)) {
      return res.status(400).json({
        message: "Invalid purchase year",
      });
    }
    /* ================= IMAGE PATHS (SCHEMA SAFE) ================= */
const images = req.files.map((file) => ({
  url: `/uploads/sell/${file.filename}`,
}));

    /* ================= PRICE CALC ================= */
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

    /* ================= CREATE REQUEST ================= */
    const sellRequest = await SellRequest.create({
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
        images, // ✅ RELATIVE PATHS ONLY
      },

      pricing: {
        basePrice,
      },

      pickup: {
        status: "Pending",
        address: {
          line1: fullAddress,
          city,
          state,
          pincode,
        },
      },

      statusHistory: [
        {
          status: "Submitted",
          changedBy: "user",
          changedAt: new Date(),
        },
      ],
    });

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

    if (!riderId) {
      return res.status(400).json({
        message: "Rider ID is required",
      });
    }

    const sellRequest = await SellRequest.findById(req.params.id);
    if (!sellRequest) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    /* ================= STATE GUARD ================= */
    if (["Picked", "Completed"].includes(sellRequest.pickup.status)) {
      return res.status(409).json({
        message: "Cannot reassign rider after pickup",
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

    sellRequest.statusHistory.push({
      status: "RiderAssigned",
      changedBy: "admin",
      changedAt: new Date(),
    });

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

    if (!sellRequest.verification?.finalPrice) {
      return res.status(409).json({ message: "Final price not set yet" });
    }

    if (sellRequest.verification.userAccepted === true) {
      return res.status(409).json({ message: "Already accepted" });
    }

    sellRequest.verification.userAccepted = true;

    sellRequest.statusHistory.push({
      status: "User Accepted Final Price",
      changedBy: "user",
      changedAt: new Date(),
    });

    await sellRequest.save();

    res.json({ success: true });
  } catch (err) {
    console.error("ACCEPT FINAL PRICE ERROR:", err);
    res.status(500).json({ message: "Failed to accept price" });
  }
};
