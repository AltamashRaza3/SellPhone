import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { auth } from "../utils/firebase";
import { Link } from "react-router-dom";

/* ================= STATUS UI MAP ================= */
const statusStyles = {
  Pending: "bg-yellow-500/20 text-yellow-400",
  Scheduled: "bg-blue-500/20 text-blue-400",
  Picked: "bg-purple-500/20 text-purple-400",
  Completed: "bg-green-500/20 text-green-400",
  Cancelled: "bg-red-500/20 text-red-400",
};

const statusText = {
  Pending: "Waiting for admin review",
  Scheduled: "Pickup has been scheduled",
  Picked: "Device inspected. Awaiting your confirmation",
  Completed: "Sell request completed successfully",
  Cancelled: "Sell request cancelled",
};

const MySellRequests = () => {
  const { user, authLoaded } = useSelector((state) => state.user);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/sell-requests/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      setRequests(await res.json());
    } catch {
      toast.error("Failed to load your sell requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoaded || !user) return;
    fetchRequests();
  }, [authLoaded, user]);

  const handleDecision = async (id, decision) => {
    try {
      setActionLoading(id);
      const res = await fetch(
        `http://localhost:5000/api/sell-requests/${id}/user-decision`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision }),
        },
      );

      if (!res.ok) throw new Error();

      toast.success(
        decision === "accept"
          ? "Price accepted. Order completed."
          : "Request cancelled.",
      );

      fetchRequests();
    } catch {
      toast.error("Failed to update request");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="appContainer py-12 text-gray-400">
        Loading your sell requests…
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="appContainer py-12 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">
          No sell requests yet
        </h2>
        <p className="text-gray-400 mb-4">
          Sell your phone in just a few steps
        </p>
        <Link to="/sale" className="btn-primary px-6 py-3">
          Sell Your Phone
        </Link>
      </div>
    );
  }

  return (
    <div className="appContainer py-12 space-y-6">
      <h1 className="text-2xl font-bold text-white">My Sell Requests</h1>

      {requests.map((req) => (
        <div key={req._id} className="glass-card space-y-4">
          {/* HEADER */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {req.phone?.brand} {req.phone?.model}
              </h3>
              <p className="text-sm text-gray-400">
                {req.phone?.storage || "—"} • {req.phone?.condition || "—"}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                statusStyles[req.status]
              }`}
            >
              {req.status}
            </span>
          </div>

          {/* PRICE */}
          <p className="text-orange-400 font-semibold">
            Expected Price: ₹{req.expectedPrice}
          </p>

          {/* STATUS INFO */}
          <p className="text-sm text-gray-300">{statusText[req.status]}</p>

          {/* ADMIN NOTE */}
          {req.adminNotes && (
            <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-sm">
              <span className="text-gray-400">Admin note:</span>{" "}
              <span className="text-white">{req.adminNotes}</span>
            </div>
          )}

          {/* PICKUP INFO */}
          {req.pickup?.status === "Scheduled" && (
            <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300 font-semibold">
                📦 Pickup Scheduled
              </p>
              <p className="text-sm text-gray-300">
                Date: {new Date(req.pickup.scheduledAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-300">
                Address: {req.pickup.address?.line1}, {req.pickup.address?.city}
              </p>
            </div>
          )}

          {/* USER APPROVAL (PHASE 21C) */}
          {req.status === "Picked" && req.verification?.finalPrice && (
            <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-gray-300">
                Revised price after inspection
              </p>

              <p className="text-2xl font-bold text-white">
                ₹{req.verification.finalPrice}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  disabled={actionLoading === req._id}
                  onClick={() => handleDecision(req._id, "accept")}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold disabled:opacity-60"
                >
                  Accept
                </button>

                <button
                  disabled={actionLoading === req._id}
                  onClick={() => handleDecision(req._id, "reject")}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MySellRequests;
