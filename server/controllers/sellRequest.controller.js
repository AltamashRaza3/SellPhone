import SellRequest from "../models/SellRequest.js";
import Rider from "../models/Rider.js";

export const assignRider = async (req, res) => {
  try {
    const { riderId } = req.body;
    const sellRequestId = req.params.id;

    if (!riderId) {
      return res.status(400).json({ message: "Rider ID required" });
    }

    const sellRequest = await SellRequest.findById(sellRequestId);
    if (!sellRequest) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    // ✅ SAFE assignment (no undefined crash)
    sellRequest.assignedRider = {
      riderId: rider._id.toString(),
      riderName: rider.name,
    };

    sellRequest.pickup = {
      status: "Scheduled",
      scheduledAt: new Date(),
    };

    sellRequest.statusHistory.push({
      status: "Pickup Scheduled",
      changedBy: "admin",
      note: `Assigned to rider ${rider.name}`,
    });

    await sellRequest.save();

    res.json({ success: true });
  } catch (err) {
    console.error("ASSIGN RIDER ERROR:", err);
    res.status(500).json({ message: "Failed to assign rider" });
  }
};
