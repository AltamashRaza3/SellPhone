import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import API_BASE_URL from "../../config/api";

const AssignRider = ({ requestId, alreadyAssigned, onAssigned }) => {
  const [riders, setRiders] = useState([]);
  const [riderId, setRiderId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingRiders, setFetchingRiders] = useState(true);

  /* ======================================================
     LOAD ACTIVE RIDERS
  ====================================================== */
  useEffect(() => {
    let isMounted = true;

    const loadRiders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/riders`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        // ✅ Correct parsing of wrapped API response
        const riderList = Array.isArray(data?.riders) ? data.riders : [];

        const validRiders = riderList.filter(
          (r) => r?._id && r?.name && r?.status === "active",
        );

        if (isMounted) {
          setRiders(validRiders);
        }
      } catch {
        toast.error("Failed to load riders");
      } finally {
        if (isMounted) setFetchingRiders(false);
      }
    };


    loadRiders();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ======================================================
     ASSIGN / REASSIGN RIDER
  ====================================================== */
  const assignRider = async () => {
    if (loading) return; // prevent double click

    if (!riderId) {
      toast.error("Please select a rider");
      return;
    }

    if (!scheduledAt) {
      toast.error("Please select pickup date & time");
      return;
    }

    const selectedDate = new Date(scheduledAt);
    const now = new Date();

    if (isNaN(selectedDate.getTime())) {
      toast.error("Invalid date selected");
      return;
    }

    if (selectedDate <= now) {
      toast.error("Pickup time must be in the future");
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
            scheduledAt: selectedDate.toISOString(), // 🔥 send full ISO datetime
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Assignment failed");
      }

      toast.success(
        alreadyAssigned
          ? "Rider reassigned successfully"
          : "Rider assigned successfully",
      );

      // Reset state safely
      setRiderId("");
      setScheduledAt("");

      onAssigned?.();
    } catch (err) {
      toast.error(err.message || "Failed to assign rider");
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 space-y-4">
      <p className="text-sm font-semibold text-yellow-400">
        {alreadyAssigned ? "Reassign Rider" : "Assign Rider"}
      </p>

      {/* DATE + TIME */}
      <div>
        <label className="text-xs text-gray-400">Pickup Date & Time</label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="input w-full mt-1"
          disabled={loading}
        />
      </div>

      {/* RIDER SELECT */}
      <select
        className="input w-full"
        value={riderId}
        onChange={(e) => setRiderId(e.target.value)}
        disabled={loading || fetchingRiders || riders.length === 0}
      >
        <option value="">
          {fetchingRiders
            ? "Loading riders..."
            : riders.length === 0
              ? "No active riders available"
              : "Select Rider"}
        </option>

        {riders.map((r) => (
          <option key={r._id} value={r._id}>
            {r.name} ({r.phone})
          </option>
        ))}
      </select>

      {/* BUTTON */}
      <button
        disabled={loading || fetchingRiders || riders.length === 0}
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
