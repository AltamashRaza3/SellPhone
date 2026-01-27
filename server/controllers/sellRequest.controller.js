import fs from "fs";
import path from "path";
import SellRequest from "../src/models/SellRequest.js";
import Rider from "../models/Rider.js";
import { calculateBasePrice } from "../utils/priceRules.js";

/* ======================================================
   CREATE SELL REQUEST (USER)
====================================================== */
export const createSellRequest = async (req, res) => {
  try {
    /* ---------- VALIDATE IMAGES ---------- */
    if (!req.files || req.files.length < 3) {
      return res.status(400).json({
        message: "At least 3 phone images are required",
      });
    }

    /* ---------- EXTRACT BODY ---------- */
    let {
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

    /* ---------- VALIDATE REQUIRED FIELDS ---------- */
    if (
      !brand ||
      !model ||
      !declaredCondition ||
      !purchaseYear ||
      !phone ||
      !fullAddress ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const year = Number(purchaseYear);
    if (Number.isNaN(year)) {
      return res.status(400).json({
        message: "Invalid purchase year",
      });
    }

    /* ---------- IMAGE PATHS ---------- */
    const imageUrls = req.files.map(
      (file) => `/uploads/sell/${file.filename}`
    );

    /* ---------- PRICE CALCULATION ---------- */
    const catalog = {
      baseMarketPrice: 22000, // can be dynamic later
      depreciationPerYear: 0.12,
      maxDepreciation: 0.6,
    };

    const basePrice = calculateBasePrice({
      catalog,
      purchaseYear: year,
      declaredCondition,
    });

    /* ---------- CREATE DOCUMENT ---------- */
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
        condition: declaredCondition, // ✅ schema-aligned
        purchaseYear: year,
        images: imageUrls,
      },

      pricing: {
        basePrice,
      },

      status: "Pending",

      pickup: {
        status: "Pending",
        address: {
          line1: fullAddress,
          city,
          state,
          pincode,
        },
      },

      history: [
        {
          action: "Request Created",
          by: "user",
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
    const sellRequestId = req.params.id;

    if (!riderId) {
      return res.status(400).json({
        message: "Rider ID is required",
      });
    }

    const sellRequest = await SellRequest.findById(sellRequestId);
    if (!sellRequest) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    /* ---------- STATUS VALIDATION ---------- */
    if (sellRequest.pickup.status !== "Pending") {
      return res.status(409).json({
        message: "Pickup already scheduled or completed",
      });
    }

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    /* ---------- ASSIGN RIDER ---------- */
    sellRequest.assignedRider = {
      riderId: rider._id,
      name: rider.name,
      phone: rider.phone,
    };

    sellRequest.pickup.status = "Scheduled";
    sellRequest.pickup.scheduledAt = scheduledAt
      ? new Date(scheduledAt)
      : new Date();

    sellRequest.history.push({
      action: "Pickup Scheduled",
      by: "admin",
      note: `Assigned to rider ${rider.name}`,
    });

    await sellRequest.save();

    return res.json({
      success: true,
      message: "Rider assigned and pickup scheduled",
      data: sellRequest,
    });
  } catch (error) {
    console.error("ASSIGN RIDER ERROR:", error);
    return res.status(500).json({
      message: "Failed to assign rider",
    });
  }
};
