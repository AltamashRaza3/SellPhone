import AdminAlert from "../models/AdminAlert.js";

/* ================= GET ALL ALERTS ================= */
export const getAdminAlerts = async (req, res) => {
  try {
    const alerts = await AdminAlert.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("sellRequestId");

    res.json({ success: true, alerts });
  } catch (err) {
    console.error("GET ALERTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

/* ================= GET UNREAD COUNT ================= */
export const getUnreadAlertCount = async (req, res) => {
  try {
    const count = await AdminAlert.countDocuments({ read: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

/* ================= MARK ALERT AS READ ================= */
export const markAlertAsRead = async (req, res) => {
  try {
    await AdminAlert.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to update alert" });
  }
};
