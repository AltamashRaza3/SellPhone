import express from "express";
import SellRequest from "../models/SellRequest.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

/* CREATE SELL REQUEST */
router.post("/", userAuth, async (req, res) => {
  try {
    const { phone, expectedPrice, contact, pickupAddress } = req.body;
    const { uid, email } = req.user;

    if (!phone || !expectedPrice || !contact?.phone || !pickupAddress) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sellRequest = await SellRequest.create({
      user: { uid, email },
      contact: {
        email,
        phone: contact.phone,
      },
      pickupAddress,
      phone,
      expectedPrice,
      statusHistory: [
        {
          status: "Pending",
          changedBy: uid,
          note: "Request submitted",
        },
      ],
    });

    res.status(201).json(sellRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit sell request" });
  }
});

/* USER SELL REQUEST HISTORY */
router.get("/my", userAuth, async (req, res) => {
  try {
    const requests = await SellRequest.find({
      "user.uid": req.user.uid,
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch {
    res.status(500).json({ message: "Failed to fetch sell requests" });
  }
});

export default router;
