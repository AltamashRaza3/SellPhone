import express from "express";
import SellRequest from "../models/SellRequest.js";
import Rider from "../models/Rider.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* ======================================================
   CREATE SELL REQUEST (USER)
====================================================== */
router.post("/", userAuth, async (req, res) => {
  try {
    const { phone, expectedPrice, contact, pickupAddress } = req.body;

    if (
      !phone ||
      !expectedPrice ||
      !contact?.phone ||
      !pickupAddress?.fullAddress ||
      !pickupAddress?.city ||
      !pickupAddress?.state ||
      !pickupAddress?.pincode
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sellRequest = await SellRequest.create({
      user: {
        uid: req.user.uid,
        email: req.user.email,
      },

      contact: {
        phone: contact.phone,
        email: req.user.email,
      },

      phone,
      expectedPrice,

      status: "Pending",

      pickup: {
        status: "Not Scheduled",
        address: {
          line1: pickupAddress.fullAddress,
          line2: pickupAddress.landmark || "",
          city: pickupAddress.city,
          state: pickupAddress.state,
          pincode: pickupAddress.pincode,
        },
      },

      assignedRider: null,

      history: [
        {
          action: "Pending",
          by: req.user.uid,
          note: "Sell request submitted by user",
        },
      ],
    });

    res.status(201).json({
      message: "Sell request submitted successfully",
      sellRequest,
    });
  } catch (err) {
    console.error("SELL REQUEST ERROR:", err);
    res.status(500).json({ message: "Failed to submit sell request" });
  }
});
/* ======================================================
   GET MY SELL REQUESTS (USER)
====================================================== */
router.get("/my", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    const requests = await SellRequest.find({
      "user.uid": uid,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(requests);
  } catch (err) {
    console.error("FETCH USER SELL REQUESTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch sell requests" });
  }
});

/* ======================================================
   ASSIGN RIDER (ADMIN)
====================================================== */
router.put("/:id/assign-rider", adminAuth, async (req, res) => {
  try {
    const { riderId, scheduledAt } = req.body;

    if (!riderId || !scheduledAt) {
      return res
        .status(400)
        .json({ message: "Rider and pickup time required" });
    }

    const pickupTime = new Date(scheduledAt);
    if (isNaN(pickupTime.getTime())) {
      return res.status(400).json({ message: "Invalid pickup time" });
    }

    const rider = await Rider.findById(riderId);
    if (!rider || rider.status !== "active") {
      return res.status(404).json({ message: "Rider not found or inactive" });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    if (!["Pending", "In Review"].includes(request.status)) {
      return res.status(400).json({
        message: "Pickup cannot be scheduled at this stage",
      });
    }

    if (!request.pickup?.address) {
      return res.status(400).json({
        message: "Pickup address missing",
      });
    }

    request.assignedRider = {
      riderId: rider._id,
      name: rider.name,
      phone: rider.phone,
    };

    request.pickup.status = "Scheduled";
    request.pickup.scheduledAt = pickupTime;

    request.status = "Pickup Scheduled";

    request.history.push({
      action: "Pickup Scheduled",
      by: req.admin._id.toString(),
      note: `Pickup assigned to rider ${rider.name}`,
    });

    await request.save();

    res.json({
      message: "Rider assigned successfully",
      request,
    });
  } catch (err) {
    console.error("ASSIGN RIDER ERROR:", err);
    res.status(500).json({ message: "Failed to assign rider" });
  }
});

/* ======================================================
   USER FINAL DECISION
====================================================== */
router.put("/:id/user-decision", userAuth, async (req, res) => {
  try {
    const { decision } = req.body;

    if (!["accept", "reject"].includes(decision)) {
      return res.status(400).json({ message: "Invalid decision" });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    if (request.status !== "Picked") {
      return res.status(400).json({
        message: "Request is not awaiting user decision",
      });
    }

    if (decision === "accept") {
      if (!request.verification?.finalPrice) {
        return res
          .status(400)
          .json({ message: "Final price not available" });
      }

      request.status = "Completed";
      request.finalPrice = request.verification.finalPrice;
    } else {
      request.status = "Cancelled";
    }

    request.history.push({
      action: request.status,
      by: request.user.uid,
      note: `User ${decision}ed final price`,
    });

    await request.save();

    res.json({
      message: "Decision recorded successfully",
      request,
    });
  } catch (err) {
    console.error("USER DECISION ERROR:", err);
    res.status(500).json({ message: "Failed to process decision" });
  }
});

export default router;
