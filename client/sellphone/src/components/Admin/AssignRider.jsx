import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import API_BASE_URL from "../../config/api";

const AssignRider = ({ requestId, alreadyAssigned, onAssigned }) => {
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRiders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/riders`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setRiders(Array.isArray(data.riders) ? data.riders : []);
    } catch {
      toast.error("Failed to load riders");
    }
  };

  useEffect(() => {
    loadRiders();
  }, []);

  const handleAssign = async () => {
    if (!selectedRider) {
      toast.error("Select a rider");
      return;
    }

    if (!scheduledAt) {
      toast.error("Select pickup date & time");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/admin/sell-requests/${requestId}/assign-rider`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            riderId: selectedRider,
            scheduledAt,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(alreadyAssigned ? "Rider reassigned" : "Rider assigned");

      onAssigned();
    } catch (err) {
      toast.error(err.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
      <p className="text-sm font-semibold text-white">
        {alreadyAssigned ? "Reassign Rider" : "Assign Rider"}
      </p>

      <select
        value={selectedRider}
        onChange={(e) => setSelectedRider(e.target.value)}
        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white"
      >
        <option value="">Select Rider</option>
        {riders
          .filter((r) => r.status === "active")
          .map((r) => (
            <option key={r._id} value={r._id}>
              {r.name} ({r.phone})
            </option>
          ))}
      </select>

      <input
        type="datetime-local"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white"
      />

      <button
        disabled={loading}
        onClick={handleAssign}
        className="w-full h-9 rounded-lg bg-blue-600 text-white text-sm font-semibold"
      >
        {loading ? "Processing..." : "Confirm Assignment"}
      </button>
    </div>
  );
};

export default AssignRider;
