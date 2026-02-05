import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import API_BASE_URL from "../../utils/api";

const AssignRider = ({ requestId,alreadyAssigned ,onAssigned }) => {
  const [riders, setRiders] = useState([]);
  const [riderId, setRiderId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOAD RIDERS ================= */
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/riders`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setRiders(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("Failed to load riders"));
  }, []);

  /* ================= ASSIGN RIDER ================= */
  const assignRider = async () => {
    if (!riderId) {
      toast.error("Please select a rider");
      return;
    }

    if (!scheduledAt) {
      toast.error("Please select pickup date");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/admin/sell-requests/${requestId}/assign-rider`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            riderId,
            scheduledAt, // ✅ NOW SENT
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Assignment failed");
      }

      toast.success("Rider assigned successfully");
      setRiderId("");
      setScheduledAt("");
      onAssigned?.();
    } catch (err) {
      toast.error(err.message || "Failed to assign rider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 space-y-3">
      <p className="text-sm font-semibold text-yellow-400">
        {alreadyAssigned ? "Reassign Rider" : "Assign Rider"}
      </p>

      {/* PICKUP DATE */}
      <div>
        <label className="text-xs text-gray-400">Pickup Date</label>
        <input
          type="date"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="input w-full mt-1"
        />
      </div>

      {/* RIDER SELECT */}
      <select
        className="input w-full"
        value={riderId}
        onChange={(e) => setRiderId(e.target.value)}
      >
        <option value="">Select Rider</option>
        {riders.map((r) => (
          <option key={r._id} value={r._id}>
            {r.name} ({r.phone})
          </option>
        ))}
      </select>

      <button
        disabled={loading}
        onClick={assignRider}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold disabled:opacity-60"
      >
        {loading
          ? alreadyAssigned
            ? "Reassigning…"
            : "Assigning…"
          : alreadyAssigned
            ? "Reassign Rider"
            : "Assign Rider"}
      </button>
    </div>
  );
};

export default AssignRider;
