import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../utils/axios";

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

const badgeStyles = {
  "Pickup Completed": "bg-green-100 text-green-700",
  "Pickup Scheduled": "bg-blue-100 text-blue-700",
  "Device Picked": "bg-indigo-100 text-indigo-700",
  "Pickup Pending": "bg-yellow-100 text-yellow-700",
  "Action Required": "bg-orange-100 text-orange-700",
  "Rejected by You": "bg-red-100 text-red-700",
  "Rejected by Admin": "bg-red-100 text-red-700",
  "Under Review": "bg-gray-100 text-gray-700",
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
      <div className="max-w-5xl mx-auto px-6 py-20 text-center text-gray-400">
        Loading your sell requests…
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          No sell requests yet
        </h2>
        <p className="text-gray-500 mt-2">
          Start by submitting your first device.
        </p>
        <Link
          to="/sale"
          className="inline-block mt-6 px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-90 transition"
        >
          Sell Your Phone
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          My Sell Requests
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Track the status of your submitted devices.
        </p>
      </div>

      <div className="space-y-6">
        {requests.map((req) => {
          const label = getStatusLabel(req);
          const needsAction =
            req.verification?.finalPrice &&
            req.verification.userAccepted == null;

          return (
            <div
              key={req._id}
              className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* LEFT */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Request #{req._id.slice(-6)}
                  </p>

                  <p className="text-xl font-semibold text-gray-900">
                    {req.phone.brand} {req.phone.model}
                  </p>

                  <p className="text-sm text-gray-500">
                    {req.phone.storage} • {req.phone.declaredCondition}
                  </p>

                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-500">
                      Estimated: ₹
                      {req.pricing.basePrice.toLocaleString("en-IN")}
                    </p>

                    {req.verification?.finalPrice && (
                      <p className="text-sm font-semibold text-green-600">
                        Final: ₹
                        {req.verification.finalPrice.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>

                  {/* RIDER INFO */}
                  {req.assignedRider && req.pickup?.status === "Scheduled" && (
                    <div className="mt-3 text-sm text-gray-600">
                      Rider: {req.assignedRider.riderName}
                      {req.assignedRider.riderPhone &&
                        ` • ${req.assignedRider.riderPhone}`}
                    </div>
                  )}
                </div>

                {/* RIGHT */}
                <div className="flex flex-col items-start md:items-end gap-4">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                      badgeStyles[label]
                    }`}
                  >
                    {label}
                  </span>

                  <Link
                    to={`/my-sell-requests/${req._id}`}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition ${
                      needsAction
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SellRequestsList;
