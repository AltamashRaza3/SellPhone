import express from "express";
import SellRequest from "../models/SellRequest.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

/* ======================================================
   CREATE SELL REQUEST (USER) — PRODUCTION READY
====================================================== */
router.post("/", userAuth, async (req, res) => {
  try {
    const {
      phone,
      expectedPrice,
      contact,
      pickupAddress,
    } = req.body;

    /* ================= VALIDATION ================= */
    if (
      !phone ||
      !expectedPrice ||
      !contact?.phone ||
      !pickupAddress?.fullAddress ||
      !pickupAddress?.city ||
      !pickupAddress?.state ||
      !pickupAddress?.pincode
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    if (!req.user?.email) {
      return res.status(400).json({
        message: "Authenticated user email not found",
      });
    }

    /* ================= CREATE REQUEST ================= */
    const sellRequest = new SellRequest({
      user: {
        uid: req.user.uid || req.user._id,
        email: req.user.email,
      },

      contact: {
        phone: contact.phone,
        email: req.user.email, // ✅ source of truth
      },

      phone,
      expectedPrice,

      pickup: {
        address: {
          line1: pickupAddress.fullAddress,
          line2: pickupAddress.landmark || "",
          city: pickupAddress.city,
          state: pickupAddress.state,
          pincode: pickupAddress.pincode,
        },
      },

      history: [
        {
          action: "Created",
          by: req.user.uid || req.user._id,
          note: "Sell request submitted by user",
        },
      ],
    });

    await sellRequest.save();

    res.status(201).json({
      message: "Sell request submitted successfully",
      sellRequest,
    });
  } catch (err) {
    console.error("SELL REQUEST ERROR:", err);
    res.status(500).json({
      message: "Failed to submit sell request",
    });
  }
});

export default router;
