import { useState } from "react";
import { toast } from "react-hot-toast";
import { getAuth } from "firebase/auth";

const SellerDecision = ({ requestId, finalPrice, onDecision }) => {
  const [loading, setLoading] = useState(false);

  if (!requestId || finalPrice === null || finalPrice === undefined) {
    return null;
  }

  const submitDecision = async (accept) => {
    const confirmMsg = accept
      ? "Do you want to accept the final price?"
      : "Do you want to reject the final price? This cannot be undone.";

    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const idToken = await user.getIdToken();

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/sell-requests/${requestId}/decision`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ accept }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Request failed");
      }

      toast.success(accept ? "Final price accepted" : "Final price rejected");
      onDecision?.();
    } catch (err) {
      toast.error(err.message || "Failed to submit decision");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-gray-900">
          Final Price Confirmation
        </h3>
        <p className="text-sm text-gray-500">
          The rider has verified your device. Please confirm the final price.
        </p>
      </div>

      {/* Price */}
      <div className="bg-gray-50 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-500 mb-1">Final Price Offered</p>
        <p className="text-3xl font-semibold text-green-600">
          ₹{finalPrice.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => submitDecision(true)}
          disabled={loading}
          className="flex-1 h-12 rounded-full bg-black text-white font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Processing…" : "Accept Price"}
        </button>

        <button
          onClick={() => submitDecision(false)}
          disabled={loading}
          className="flex-1 h-12 rounded-full border border-gray-300 text-gray-900 font-medium hover:bg-gray-100 transition disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default SellerDecision;
