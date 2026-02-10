import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import API_BASE_URL from "../../config/api";
import CreateRider from "../../components/Admin/CreateRider";

const AdminRiders = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD RIDERS ================= */
  const loadRiders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/riders`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setRiders(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load riders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiders();
  }, []);

  /* ================= TOGGLE STATUS ================= */
  const toggleStatus = async (rider) => {
    const newStatus = rider.status === "active" ? "inactive" : "active";

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/riders/${rider._id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!res.ok) throw new Error();

      toast.success(`Rider ${newStatus}`);
      loadRiders();
    } catch {
      toast.error("Failed to update rider status");
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6">
      {/* CREATE RIDER */}
      <CreateRider onCreated={loadRiders} />

      <div className="glass-card">
        <h3 className="text-lg font-semibold text-white mb-4">Riders</h3>

        {loading ? (
          <p className="text-sm text-gray-400">Loading riders…</p>
        ) : riders.length === 0 ? (
          <p className="text-sm text-gray-400">No riders found</p>
        ) : (
          <div className="space-y-3">
            {riders.map((r) => (
              <div
                key={r._id}
                className="flex justify-between items-center text-sm"
              >
                <div>
                  <p className="text-white font-medium">{r.name}</p>
                  <p className="text-gray-400">{r.phone}</p>

                  {r.lastLoginAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last login: {new Date(r.lastLoginAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleStatus(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    r.status === "active"
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  }`}
                >
                  {r.status}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRiders;
