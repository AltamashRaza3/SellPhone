import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../../src/utils/axios";

/* ================= STATUS HELPERS ================= */
const getStatusLabel = (req) => {
  if (req.pickup?.status === "Completed") return "Pickup Completed";
  if (req.pickup?.status === "Picked") return "Device Picked";
  if (req.pickup?.status === "Scheduled") return "Pickup Scheduled";
  if (req.pickup?.status === "Pending") return "Pickup Pending";

  if (req.verification?.finalPrice && req.verification.userAccepted == null) {
    return "Action Required";
  }

  if (req.verification?.userAccepted === false) {
    return "Rejected by You";
  }

  if (req.admin?.status === "Rejected") return "Rejected by Admin";

  return "Under Review";
};

const badgeColor = {
  "Pickup Completed": "bg-green-600/20 text-green-400",
  "Pickup Scheduled": "bg-blue-500/20 text-blue-400",
  "Device Picked": "bg-indigo-500/20 text-indigo-400",
  "Pickup Pending": "bg-yellow-500/20 text-yellow-400",
  "Action Required": "bg-orange-500/20 text-orange-400",
  "Rejected by You": "bg-red-600/20 text-red-400",
  "Rejected by Admin": "bg-red-500/20 text-red-400",
  "Under Review": "bg-gray-500/20 text-gray-300",
};

const SellRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH REQUESTS ================= */
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await api.get("/sell-requests/my");
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("SELL REQUEST LOAD ERROR:", err);
        toast.error("Failed to load sell requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="appContainer py-12 text-center text-gray-400">
        Loading…
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="appContainer py-12 text-center">
        <h2 className="text-xl font-semibold">No sell requests yet</h2>
        <Link to="/sale" className="btn-primary mt-4 inline-block">
          Sell Your Phone
        </Link>
      </div>
    );
  }

  return (
    <div className="appContainer py-12 space-y-6">
      <h1 className="text-2xl font-bold">My Sell Requests</h1>

      {requests.map((req) => {
        const label = getStatusLabel(req);
        const needsAction =
          req.verification?.finalPrice && req.verification.userAccepted == null;

        return (
          <div key={req._id} className="glass-card p-6 space-y-4">
            {/* HEADER */}
            <div>
              <h3 className="text-lg font-semibold">
                {req.phone.brand} {req.phone.model}
              </h3>
              <p className="text-sm text-gray-400">
                {req.phone.storage} • {req.phone.declaredCondition}
              </p>
            </div>

            {/* PRICES */}
            <div className="space-y-1">
              <p className="text-orange-400">
                Estimated Price: ₹
                {req.pricing.basePrice.toLocaleString("en-IN")}
              </p>

              {req.verification?.finalPrice && (
                <p className="text-green-400 font-semibold">
                  Final Price: ₹
                  {req.verification.finalPrice.toLocaleString("en-IN")}
                </p>
              )}
            </div>

            {/* RIDER DETAILS */}
            {req.assignedRider && req.pickup?.status === "Scheduled" && (
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                <p className="text-sm font-semibold text-indigo-400">
                  Assigned Rider
                </p>
                <p className="text-sm text-white">
                  {req.assignedRider.riderName}
                </p>
                {req.assignedRider.riderPhone && (
                  <p className="text-sm text-gray-300">
                    📞 {req.assignedRider.riderPhone}
                  </p>
                )}
              </div>
            )}

            {/* FOOTER */}
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
              <span
                className={`h-7 px-4 rounded text-sm flex items-center ${badgeColor[label]}`}
              >
                {label}
              </span>

              <Link
                to={`/my-sell-requests/${req._id}`}
                className={`h-8 px-5 rounded-lg text-sm font-medium flex items-center transition ${
                  needsAction
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-zinc-800 hover:bg-zinc-700 text-white"
                }`}
              >
                View Details
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SellRequestsList;
