import SellRequest from "../models/SellRequest.js";
import Rider from "../models/Rider.js";

export const getRiderPerformance = async (req, res) => {
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
              $cond: [
                { $eq: ["$pickup.status", "Completed"] },
                1,
                0,
              ],
            },
          },
          rejectedPickups: {
            $sum: {
              $cond: [
                { $eq: ["$pickup.status", "Rejected"] },
                1,
                0,
              ],
            },
          },
          totalEarnings: {
            $sum: "$riderPayout.amount",
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
                  {
                    $divide: [
                      "$rejectedPickups",
                      "$totalPickups",
                    ],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
      {
        $sort: { completedPickups: -1 },
      },
    ]);

    res.json({
      success: true,
      riders: result,
    });
  } catch (error) {
    console.error("RIDER PERFORMANCE ERROR:", error);
    res.status(500).json({
      message: "Failed to load rider performance",
    });
  }
};
