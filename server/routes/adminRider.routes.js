import express from "express";
import Rider from "../models/Rider.js";
import SellRequest from "../src/models/SellRequest.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* ======================================================
   RIDER PERFORMANCE (OVERALL)
   GET /api/admin/riders/performance
====================================================== */
router.get("/performance", adminAuth, async (req, res) => {
  try {
    const result = await SellRequest.aggregate([
      {
        $match: {
          "pickup.status": { $in: ["Completed", "Rejected"] },
        },
      },
      {
        $group: {
          _id: "$assignedRider.riderId",
          riderName: { $first: "$assignedRider.riderName" },
          totalPickups: { $sum: 1 },
          completedPickups: {
            $sum: {
              $cond: [{ $eq: ["$pickup.status", "Completed"] }, 1, 0],
            },
          },
          rejectedPickups: {
            $sum: {
              $cond: [{ $eq: ["$pickup.status", "Rejected"] }, 1, 0],
            },
          },
          totalEarnings: {
            $sum: { $ifNull: ["$riderPayout.amount", 0] },
          },
        },
      },
      {
        $project: {
          riderName: 1,
          totalPickups: 1,
          completedPickups: 1,
          rejectedPickups: 1,
          totalEarnings: 1,
          rejectionRate: {
            $cond: [
              { $eq: ["$totalPickups", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$rejectedPickups", "$totalPickups"] },
                  100,
                ],
              },
            ],
          },
        },
      },
      { $sort: { completedPickups: -1 } },
    ]);

    res.json({ success: true, riders: result });
  } catch (err) {
    console.error("RIDER PERFORMANCE ERROR:", err);
    res.status(500).json({
      message: "Failed to load rider performance",
    });
  }
});

/* ======================================================
   MONTHLY RIDER PERFORMANCE
   GET /api/admin/riders/performance/monthly?month=YYYY-MM
====================================================== */
router.get("/performance/monthly", adminAuth, async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        message: "Month is required (YYYY-MM)",
      });
    }

    const [year, monthNumber] = month.split("-").map(Number);

    const startDate = new Date(year, monthNumber - 1, 1);
    const endDate = new Date(year, monthNumber, 1);

    const result = await SellRequest.aggregate([
      {
        $match: {
          "pickup.status": { $in: ["Completed", "Rejected"] },
          "pickup.completedAt": {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$assignedRider.riderId",
          riderName: { $first: "$assignedRider.riderName" },
          totalPickups: { $sum: 1 },
          completedPickups: {
            $sum: {
              $cond: [{ $eq: ["$pickup.status", "Completed"] }, 1, 0],
            },
          },
          rejectedPickups: {
            $sum: {
              $cond: [{ $eq: ["$pickup.status", "Rejected"] }, 1, 0],
            },
          },
          totalEarnings: {
            $sum: { $ifNull: ["$riderPayout.amount", 0] },
          },
        },
      },
      {
        $project: {
          riderName: 1,
          totalPickups: 1,
          completedPickups: 1,
          rejectedPickups: 1,
          totalEarnings: 1,
          rejectionRate: {
            $cond: [
              { $eq: ["$totalPickups", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$rejectedPickups", "$totalPickups"] },
                  100,
                ],
              },
            ],
          },
        },
      },
      { $sort: { completedPickups: -1 } },
    ]);

    res.json({
      success: true,
      month,
      riders: result,
    });
  } catch (err) {
    console.error("MONTHLY PERFORMANCE ERROR:", err);
    res.status(500).json({
      message: "Failed to load monthly performance",
    });
  }
});

/* ======================================================
   GET ALL RIDERS
   GET /api/admin/riders?status=active|inactive
====================================================== */
router.get("/", adminAuth, async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status === "active") filter.status = "active";
    if (status === "inactive") filter.status = "inactive";

    const riders = await Rider.find(filter).sort({ createdAt: 1 });

    res.json({ success: true, riders });
  } catch (err) {
    console.error("FETCH RIDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch riders" });
  }
});

/* ======================================================
   CREATE RIDER
====================================================== */
router.post("/", adminAuth, async (req, res) => {
  try {
    const { name, phone, city } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone must be 10 digits",
      });
    }

    const existing = await Rider.findOne({ phone });
    if (existing) {
      return res.status(409).json({
        message: "Rider already exists",
      });
    }

    const rider = await Rider.create({
      name: name.trim(),
      phone: phone.trim(),
      city: city?.trim(),
      status: "active",
      createdBy: req.admin?._id,
    });

    res.status(201).json({ success: true, rider });
  } catch (err) {
    console.error("CREATE RIDER ERROR:", err);
    res.status(500).json({ message: "Failed to create rider" });
  }
});

/* ======================================================
   UPDATE RIDER
====================================================== */
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id);

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    if (req.body.name !== undefined)
      rider.name = req.body.name.trim();

    if (req.body.city !== undefined)
      rider.city = req.body.city.trim();

    await rider.save();

    res.json({ success: true, rider });
  } catch (err) {
    console.error("UPDATE RIDER ERROR:", err);
    res.status(500).json({ message: "Failed to update rider" });
  }
});

/* ======================================================
   UPDATE RIDER STATUS
====================================================== */
router.patch("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const rider = await Rider.findByIdAndUpdate(
      req.params.id,
      {
        status,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: req.admin?._id,
      },
      { new: true }
    );

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    res.json({ success: true, rider });
  } catch (err) {
    console.error("UPDATE RIDER STATUS ERROR:", err);
    res.status(500).json({
      message: "Failed to update rider status",
    });
  }
});

export default router;
