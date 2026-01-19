import express from "express";
import SellRequest from "../models/SellRequest.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

const ALLOWED_STATUS = [
  "Pending",
  "In Review",
  "Approved",
  "Rejected",
];

/* ======================================================
   GET ALL SELL REQUESTS (ADMIN)
====================================================== */
router.get("/", adminAuth, async (req, res) => {
  try {
    const requests = await SellRequest.find().sort({ createdAt: -1 });

    const normalized = requests.map((doc) => {
      const r = doc.toObject();

      // Ensure pickup exists
      if (!r.pickup) r.pickup = {};

      // Normalize address for ALL historical formats
      if (!r.pickup.address) {
        // Case 1: very old string address
        if (typeof r.address === "string") {
          r.pickup.address = {
            line1: r.address,
            city: "",
            state: "",
            pincode: "",
          };
        }

        // Case 2: old object with fullAddress
        else if (r.address?.fullAddress) {
          r.pickup.address = {
            line1: r.address.fullAddress,
            city: r.address.city || "",
            state: r.address.state || "",
            pincode: r.address.pincode || "",
          };
        }

        // Case 3: old pickupAddress object
        else if (r.pickupAddress?.fullAddress) {
          r.pickup.address = {
            line1: r.pickupAddress.fullAddress,
            line2: r.pickupAddress.landmark || "",
            city: r.pickupAddress.city || "",
            state: r.pickupAddress.state || "",
            pincode: r.pickupAddress.pincode || "",
          };
        } else {
          r.pickup.address = null;
        }
      }

      return r;
    });

    res.json(normalized);
  } catch (err) {
    console.error("ADMIN FETCH SELL REQUESTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch sell requests" });
  }
});


/* ======================================================
   UPDATE STATUS (ADMIN)
====================================================== */
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    request.status = status;
    request.adminNotes = note || "";

    request.history.push({
      action: "Status Updated",
      by: req.admin._id,
      note: note || `Marked as ${status}`,
    });

    await request.save();

    res.json(request); // ✅ FULL document back
  } catch (err) {
    console.error("ADMIN UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

export default router;
