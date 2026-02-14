import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/alerts`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setAlerts(data.alerts);
    } catch (err) {
      console.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/alerts/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });

      setAlerts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, read: true } : a)),
      );
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  if (loading) return <div className="text-gray-400">Loading alerts...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">🚨 Admin Alerts</h2>

      {alerts.length === 0 && (
        <div className="text-gray-400">No alerts yet.</div>
      )}

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert._id}
            className={`p-5 rounded-2xl backdrop-blur border ${
              alert.read
                ? "bg-white/5 border-white/10"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-white font-medium">{alert.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>

              {!alert.read && (
                <button
                  onClick={() => markAsRead(alert._id)}
                  className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
                >
                  Mark Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAlerts;
