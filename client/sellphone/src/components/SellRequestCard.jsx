import { useState } from "react";
import { submitUserDecision } from "../api/sellRequest.api";
import { toast } from "react-hot-toast";

const SellRequestCard = ({ request, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const canDecide =
    request.adminStatus === "Approved" &&
    request.userDecision === "Pending" &&
    request.finalStatus === "Open" &&
    request.finalPrice;

  const handleDecision = async (decision) => {
    if (loading) return;

    const confirmMsg =
      decision === "accept"
        ? "Do you want to accept the final price?"
        : "Do you want to reject the final price? This cannot be undone.";

    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      await submitUserDecision(request._id, decision);
      toast.success(
        decision === "accept" ? "Final price accepted" : "Final price rejected",
      );
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit decision");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-white">
          {request.phone?.brand} {request.phone?.model}
        </h3>
        <span className="text-sm text-gray-400">
          {new Date(request.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="text-sm text-gray-300">
        Expected Price: ₹{request.expectedPrice}
      </div>

      {request.finalPrice && (
        <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
          <p className="text-gray-300 text-sm">Final Price Offered</p>
          <p className="text-2xl font-bold text-green-400">
            ₹{request.finalPrice}
          </p>
        </div>
      )}

      {/* STATUS BADGES */}
      <div className="flex gap-3 text-sm">
        <span className="px-3 py-1 rounded bg-gray-700 text-gray-200">
          Admin: {request.adminStatus}
        </span>
        <span className="px-3 py-1 rounded bg-gray-700 text-gray-200">
          User: {request.userDecision}
        </span>
      </div>

      {/* ACTION BUTTONS */}
      {canDecide && (
        <div className="flex gap-4">
          <button
            onClick={() => handleDecision("accept")}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
          >
            Accept Price
          </button>

          <button
            onClick={() => handleDecision("reject")}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {/* FINAL STATE MESSAGE */}
      {!canDecide && request.userDecision !== "Pending" && (
        <div className="text-sm text-gray-400">
          {request.userDecision === "Accepted"
            ? "You accepted the final price. Pickup will be scheduled."
            : "You rejected the final price. This request is closed."}
        </div>
      )}
    </div>
  );
};

export default SellRequestCard;
