import { useState } from "react";
import { toast } from "react-hot-toast";

const SellerDecision = ({ requestId, finalPrice, onDecision }) => {
  const [loading, setLoading] = useState(false);

  // 🛡️ HARD GUARD (prevents crashes)
  if (!requestId || !finalPrice) return null;

  const submitDecision = async (accept) => {
    const confirmMsg = accept
      ? "Do you want to accept the final price?"
      : "Do you want to reject the final price? This cannot be undone.";

    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/sell-requests/${requestId}/decision`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accept }),
        },
      );

      if (!res.ok) throw new Error();

      toast.success(
        accept ? "Price accepted successfully" : "Request rejected",
      );

      onDecision?.();
    } catch {
      toast.error("Failed to submit decision");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white">
        Final Price Confirmation
      </h3>

      <p className="text-sm text-zinc-400">
        The rider has verified your device. Please accept or reject the final
        price.
      </p>

      <p className="text-2xl font-bold text-green-400">
        ₹{finalPrice.toLocaleString("en-IN")}
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => submitDecision(true)}
          disabled={loading}
          className="flex-1 h-11 rounded-xl bg-emerald-600 text-black font-semibold disabled:opacity-50"
        >
          Accept Price
        </button>

        <button
          onClick={() => submitDecision(false)}
          disabled={loading}
          className="flex-1 h-11 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default SellerDecision;
