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
    const allRiders = await Rider.find({}).lean();

    const performance = await SellRequest.aggregate([
      {
        $match: {
          "pickup.status": { $in: ["Completed", "Rejected"] },
        },
      },
      {
        $group: {
          _id: "$assignedRider.riderId",
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
    ]);

    const performanceMap = {};
    performance.forEach((p) => {
      performanceMap[p._id.toString()] = p;
    });

    const merged = allRiders.map((rider) => {
      const stats = performanceMap[rider._id.toString()] || {};

      const totalPickups = stats.totalPickups || 0;
      const completedPickups = stats.completedPickups || 0;
      const rejectedPickups = stats.rejectedPickups || 0;

      return {
        _id: rider._id,
        riderName: rider.name,
        totalPickups,
        completedPickups,
        rejectedPickups,
        totalEarnings: stats.totalEarnings || 0,
        rejectionRate:
          totalPickups === 0
            ? 0
            : (rejectedPickups / totalPickups) * 100,
      };
    });

    merged.sort((a, b) => b.completedPickups - a.completedPickups);

    res.json({ success: true, riders: merged });
  } catch (err) {
    console.error("RIDER PERFORMANCE ERROR:", err);
    res.status(500).json({ message: "Failed to load rider performance" });
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

    const allRiders = await Rider.find({}).lean();

    const performance = await SellRequest.aggregate([
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
    ]);

    const performanceMap = {};
    performance.forEach((p) => {
      performanceMap[p._id.toString()] = p;
    });

    const merged = allRiders.map((rider) => {
      const stats = performanceMap[rider._id.toString()] || {};

      const totalPickups = stats.totalPickups || 0;
      const completedPickups = stats.completedPickups || 0;
      const rejectedPickups = stats.rejectedPickups || 0;

      return {
        _id: rider._id,
        riderName: rider.name,
        totalPickups,
        completedPickups,
        rejectedPickups,
        totalEarnings: stats.totalEarnings || 0,
        rejectionRate:
          totalPickups === 0
            ? 0
            : (rejectedPickups / totalPickups) * 100,
      };
    });

    merged.sort((a, b) => b.completedPickups - a.completedPickups);

    res.json({
      success: true,
      month,
      riders: merged,
    });
  } catch (err) {
    console.error("MONTHLY PERFORMANCE ERROR:", err);
    res.status(500).json({
      message: "Failed to load monthly performance",
    });
  }
});
/* ======================================================
   UPDATE RIDER STATUS (ACTIVE / INACTIVE)
====================================================== */
router.patch("/riders/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid rider status",
      });
    }

    const rider = await Rider.findById(req.params.id);

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    rider.status = status;
    rider.statusUpdatedAt = new Date();
    rider.statusUpdatedBy = req.admin._id;

    await rider.save();

    res.json({
      success: true,
      message: `Rider ${status}`,
    });

  } catch (err) {
    console.error("UPDATE RIDER STATUS ERROR:", err);
    res.status(500).json({
      message: "Failed to update rider status",
    });
  }
});

/* ======================================================
   GET ALL RIDERS
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

export default router;
