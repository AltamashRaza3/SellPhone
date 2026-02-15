import { useState } from "react";
import { toast } from "react-hot-toast";
import { submitUserDecision } from "../api/sellRequest.api";

const SellRequestCard = ({ request, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const {
    phone,
    pricing,
    verification,
    assignedRider,
    createdAt,
    workflowStatus,
  } = request;

  /* ================= DECISION GUARD ================= */
  const canDecide =
    workflowStatus === "UNDER_VERIFICATION" &&
    verification?.finalPrice &&
    verification.userAccepted == null;

  const handleDecision = async (accept) => {
    if (loading) return;

    const confirmMsg = accept
      ? "Do you want to accept the final price?"
      : "Do you want to reject the final price? This action cannot be undone.";

    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      await submitUserDecision(request._id, accept);
      toast.success(accept ? "Final price accepted" : "Final price rejected");
      onUpdate?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATUS LABEL (UI LAYER ONLY) ================= */
  const getStatus = () => {
    const map = {
      CREATED: "Pending Review",
      ADMIN_APPROVED: "Approved",
      ASSIGNED_TO_RIDER: "Pickup Scheduled",
      UNDER_VERIFICATION: "Action Required",
      USER_ACCEPTED: "Price Accepted",
      REJECTED_BY_RIDER: "Rejected",
      COMPLETED: "Pickup Completed",
      CANCELLED: "Cancelled",
    };

    return map[workflowStatus] || "Under Review";
  };

  const status = getStatus();

  const badgeStyles = {
    "Pickup Completed": "bg-green-100 text-green-700",
    "Price Accepted": "bg-green-100 text-green-700",
    "Action Required": "bg-orange-100 text-orange-700",
    "Pickup Scheduled": "bg-blue-100 text-blue-700",
    Approved: "bg-yellow-100 text-yellow-700",
    Rejected: "bg-red-100 text-red-700",
    Cancelled: "bg-red-100 text-red-700",
    "Pending Review": "bg-gray-100 text-gray-700",
    "Under Review": "bg-gray-100 text-gray-700",
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 transition hover:shadow-md">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {phone.brand} {phone.model}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {phone.storage} • {phone.declaredCondition}
          </p>
        </div>

        <div className="text-sm text-gray-400">
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* STATUS BADGE */}
      <div className="mt-5">
        <span
          className={`px-4 py-1.5 rounded-full text-xs font-medium ${
            badgeStyles[status]
          }`}
        >
          {status}
        </span>
      </div>

      {/* PRICING */}
      <div className="mt-6 space-y-2">
        <div>
          <p className="text-sm text-gray-500">Estimated Price</p>
          <p className="text-lg font-semibold text-gray-900">
            ₹{pricing.basePrice.toLocaleString("en-IN")}
          </p>
        </div>

        {verification?.finalPrice && (
          <div className="mt-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Final Price Offered</p>
            <p className="text-2xl font-semibold text-green-600">
              ₹{verification.finalPrice.toLocaleString("en-IN")}
            </p>
          </div>
        )}
      </div>

      {/* RIDER INFO */}
      {workflowStatus === "ASSIGNED_TO_RIDER" && assignedRider?.riderName && (
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-sm font-medium text-blue-700">Assigned Rider</p>
          <p className="text-sm text-gray-800 mt-1">
            {assignedRider.riderName}
          </p>
          {assignedRider.riderPhone && (
            <p className="text-sm text-gray-600">
              📞 {assignedRider.riderPhone}
            </p>
          )}
        </div>
      )}

      {/* ACTION BUTTONS */}
      {canDecide && (
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => handleDecision(true)}
            disabled={loading}
            className="flex-1 bg-black text-white py-3 rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            Accept Price
          </button>

          <button
            onClick={() => handleDecision(false)}
            disabled={loading}
            className="flex-1 border border-gray-300 py-3 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {/* FINAL STATES */}
      {workflowStatus === "USER_ACCEPTED" && (
        <p className="mt-6 text-green-600 text-sm font-medium">
          You accepted the final price. Pickup will be completed.
        </p>
      )}

      {workflowStatus === "REJECTED_BY_RIDER" && (
        <p className="mt-6 text-red-600 text-sm font-medium">
          This request was rejected after verification.
        </p>
      )}
    </div>
  );
};

export default SellRequestCard;
