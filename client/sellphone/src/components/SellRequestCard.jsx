import { useState } from "react";
import { toast } from "react-hot-toast";
import { submitUserDecision } from "../api/sellRequest.api";

const SellRequestCard = ({ request, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const {
    phone,
    pricing,
    admin,
    verification,
    pickup,
    assignedRider,
    createdAt,
  } = request;

  /* ================= DECISION GUARD ================= */
  const canDecide =
    admin?.status === "Approved" &&
    verification?.finalPrice &&
    verification.userAccepted === null;

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

  /* ================= STATUS LABEL ================= */
  const getStatus = () => {
    if (pickup?.status === "Completed") return "Pickup Completed";
    if (verification?.userAccepted === true) return "Price Accepted";
    if (verification?.userAccepted === false) return "Price Rejected";
    if (verification?.finalPrice) return "Action Required";
    if (pickup?.status === "Scheduled") return "Pickup Scheduled";
    if (admin?.status === "Rejected") return "Rejected by Admin";
    return "Under Review";
  };

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-5 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-white">
          {phone.brand} {phone.model}
        </h3>
        <span className="text-sm text-zinc-400">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* PHONE INFO */}
      <p className="text-sm text-zinc-400">
        {phone.storage} • {phone.declaredCondition}
      </p>

      {/* BASE PRICE */}
      <p className="text-orange-400">
        Estimated Price: ₹{pricing.basePrice.toLocaleString("en-IN")}
      </p>

      {/* FINAL PRICE */}
      {verification?.finalPrice && (
        <div className="p-4 rounded-lg bg-zinc-800 border border-white/10">
          <p className="text-sm text-zinc-400">Final Price Offered</p>
          <p className="text-2xl font-bold text-green-400">
            ₹{verification.finalPrice.toLocaleString("en-IN")}
          </p>
        </div>
      )}

      {/* STATUS BADGES */}
      <div className="flex gap-2 flex-wrap text-sm">
        <span className="px-3 py-1 rounded bg-zinc-800 text-zinc-300">
          Status: {getStatus()}
        </span>

        {admin?.status && (
          <span className="px-3 py-1 rounded bg-zinc-800 text-zinc-300">
            Admin: {admin.status}
          </span>
        )}

        {assignedRider?.riderName && (
          <span className="px-3 py-1 rounded bg-zinc-800 text-zinc-300">
            Rider Assigned
          </span>
        )}
      </div>

      {/* ACTION BUTTONS */}
      {canDecide && (
        <div className="flex gap-4">
          <button
            onClick={() => handleDecision(true)}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-black py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            Accept Price
          </button>

          <button
            onClick={() => handleDecision(false)}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            Reject Price
          </button>
        </div>
      )}

      {/* FINAL MESSAGE */}
      {verification?.userAccepted === true && (
        <p className="text-green-400 text-sm font-medium">
          You accepted the final price. Pickup will be completed.
        </p>
      )}

      {verification?.userAccepted === false && (
        <p className="text-red-400 text-sm font-medium">
          You rejected the final price. This request is closed.
        </p>
      )}
    </div>
  );
};

export default SellRequestCard;
