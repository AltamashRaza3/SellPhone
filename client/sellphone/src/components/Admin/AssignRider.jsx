import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const AssignRider = ({ requestId, onAssigned }) => {
  const [riders, setRiders] = useState([]);
  const [riderId, setRiderId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOAD RIDERS ================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/riders", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load riders");
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

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/sell-requests/${requestId}/assign-rider`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            riderId,
            scheduledAt: scheduledAt || undefined,
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
      console.error("ASSIGN RIDER ERROR:", err);
      toast.error(err.message || "Failed to assign rider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 space-y-3">
      <p className="text-sm font-semibold text-yellow-400">Assign Rider</p>

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

      <input
        type="datetime-local"
        className="input w-full"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
      />

      <button
        disabled={loading}
        onClick={assignRider}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold disabled:opacity-60"
      >
        {loading ? "Assigning…" : "Assign Rider"}
      </button>
    </div>
  );
};

export default AssignRider;
