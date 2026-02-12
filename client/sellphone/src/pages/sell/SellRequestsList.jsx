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
  "Pickup Completed": "bg-green-50 text-green-700",
  "Pickup Scheduled": "bg-blue-50 text-blue-700",
  "Device Picked": "bg-indigo-50 text-indigo-700",
  "Pickup Pending": "bg-yellow-50 text-yellow-700",
  "Action Required": "bg-orange-50 text-orange-700",
  "Rejected by You": "bg-red-50 text-red-700",
  "Rejected by Admin": "bg-red-50 text-red-700",
  "Under Review": "bg-gray-100 text-gray-700",
};

const SellRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f5f5f7] text-gray-400 text-sm">
        Loading your sell requests…
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (!requests.length) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#f5f5f7] px-6">
        <div className="text-center space-y-6 max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
            No sell requests yet
          </h2>

          <p className="text-gray-500 leading-relaxed">
            Start by submitting your first device and track everything here.
          </p>

          <Link
            to="/sale"
            className="inline-block px-8 py-3 rounded-full bg-black text-white text-sm font-medium hover:scale-[1.03] transition"
          >
            Sell Your Phone
          </Link>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="bg-[#f5f5f7] min-h-screen py-28">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-5xl px-6 flex flex-col items-center space-y-20">
          {/* HEADER */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
              My Sell Requests
            </h1>
            <p className="text-gray-500 text-lg max-w-xl">
              Track your submitted devices and stay updated on pickup,
              verification and payment status.
            </p>
          </div>

          {/* CARDS */}
          <div className="w-full flex flex-col gap-14">
            {requests.map((req) => {
              const label = getStatusLabel(req);
              const needsAction =
                req.verification?.finalPrice &&
                req.verification.userAccepted == null;

              return (
                <div
                  key={req._id}
                  className="
          w-full
          bg-white
          rounded-3xl
          px-20
          py-16
          shadow-[0_15px_50px_rgba(0,0,0,0.05)]
          transition
          hover:shadow-[0_25px_70px_rgba(0,0,0,0.08)]
        "
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16">
                    {/* LEFT */}
                    <div className="space-y-6 max-w-2xl">
                      <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
                        Request #{req._id.slice(-6)}
                      </p>

                      <h3 className="text-4xl font-semibold tracking-tight text-gray-900">
                        {req.phone.brand} {req.phone.model}
                      </h3>

                      <p className="text-lg text-gray-500">
                        {req.phone.storage} • {req.phone.declaredCondition}
                      </p>

                      <div className="pt-4 space-y-2">
                        <p className="text-base text-gray-500">
                          Estimated: ₹
                          {req.pricing.basePrice.toLocaleString("en-IN")}
                        </p>

                        {req.verification?.finalPrice && (
                          <p className="text-xl font-semibold text-green-600">
                            Final: ₹
                            {req.verification.finalPrice.toLocaleString(
                              "en-IN",
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-col items-start lg:items-end gap-8">
                      <span
                        className={`
                px-8 py-3
                rounded-full
                text-sm
                font-medium
                ${badgeStyles[label]}
              `}
                      >
                        {label}
                      </span>

                      <Link
                        to={`/my-sell-requests/${req._id}`}
                        className={`
                px-12 py-4
                rounded-full
                text-base
                font-medium
                transition
                ${
                  needsAction
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-black text-white hover:opacity-90"
                }
              `}
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
      </div>
    </div>
  );
};

export default SellRequestsList;
