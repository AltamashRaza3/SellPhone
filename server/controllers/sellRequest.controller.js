import SellRequest from "../models/SellRequest.js";
import Rider from "../models/Rider.js";

export const assignRider = async (req, res) => {
  try {
    const { riderId, scheduledAt } = req.body;
    const sellRequestId = req.params.id;

    /* ================= BASIC VALIDATION ================= */
    if (!riderId) {
      return res.status(400).json({ message: "Rider ID is required" });
    }

    const sellRequest = await SellRequest.findById(sellRequestId);
    if (!sellRequest) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    /* ================= ADMIN APPROVAL REQUIRED ================= */
    if (sellRequest.admin?.status !== "Approved") {
      return res.status(409).json({
        message: "Admin approval required before assigning rider",
      });
    }

    /* ================= PREVENT DOUBLE ASSIGN ================= */
    if (sellRequest.assignedRider?.riderId) {
      return res.status(409).json({
        message: "Rider already assigned",
      });
    }

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    /* ================= ASSIGN RIDER ================= */
    sellRequest.assignedRider = {
      riderId: rider._id,
      name: rider.name,
      phone: rider.phone,
      assignedAt: new Date(),
    };

    sellRequest.pickup = {
      status: "Scheduled",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      address: sellRequest.pickup?.address,
    };

    /* ================= AUDIT LOG ================= */
    sellRequest.history.push({
      action: "PICKUP_SCHEDULED",
      by: "admin",
      note: `Pickup assigned to rider ${rider.name}`,
      at: new Date(),
    });

    await sellRequest.save();

    return res.json({
      success: true,
      message: "Rider assigned and pickup scheduled",
    });
  } catch (err) {
    console.error("ASSIGN RIDER ERROR:", err);
    return res.status(500).json({
      message: "Failed to assign rider",
    });
  }
};
