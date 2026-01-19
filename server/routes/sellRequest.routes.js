import express from "express";
import SellRequest from "../models/SellRequest.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

/* ======================================================
   CREATE SELL REQUEST (USER)
====================================================== */
router.post("/", userAuth, async (req, res) => {
  try {
    const { phone, expectedPrice, contact, pickupAddress } = req.body;
    const { uid, email } = req.user;

    /* -------- Validation -------- */
    if (
      !phone ||
      !phone.brand ||
      !phone.model ||
      !phone.condition ||
      !expectedPrice ||
      !contact?.phone ||
      !pickupAddress?.line1 ||
      !pickupAddress?.city ||
      !pickupAddress?.state ||
      !pickupAddress?.pincode
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    /* -------- Normalize data -------- */
    const normalizedContactPhone = String(contact.phone).replace(/\D/g, "");

    const sellRequest = await SellRequest.create({
      user: {
        uid,
        email,
      },

      contact: {
        email,
        phone: normalizedContactPhone,
      },

      pickupAddress: {
        line1: pickupAddress.line1,
        line2: pickupAddress.line2 || "",
        city: pickupAddress.city,
        state: pickupAddress.state,
        pincode: pickupAddress.pincode,
      },

      phone: {
        brand: phone.brand,
        model: phone.model,
        storage: phone.storage || "",
        ram: phone.ram || "",
        color: phone.color || "",
        condition: phone.condition,
        images: Array.isArray(phone.images) ? phone.images : [],
      },

      expectedPrice: Number(expectedPrice),

      status: "Pending",
      adminNotes: "",

      statusHistory: [
        {
          status: "Pending",
          changedBy: uid,
          note: "Sell request submitted by user",
        },
      ],
    });

    res.status(201).json(sellRequest);
  } catch (error) {
    console.error("SELL REQUEST ERROR:", error);
    res.status(500).json({
      message: "Failed to submit sell request",
    });
  }
});

/* ======================================================
   USER SELL REQUEST HISTORY
====================================================== */
router.get("/my", userAuth, async (req, res) => {
  try {
    const requests = await SellRequest.find({
      "user.uid": req.user.uid,
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("FETCH MY SELL REQUESTS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch sell requests",
    });
  }
});

export default router;
