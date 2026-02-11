import { useEffect, useState } from "react";
import riderApi from "../api/riderApi";
import { toast } from "react-hot-toast";

const Earnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        const res = await riderApi.get("/earnings");
        setEarnings(res.data);
      } catch {
        toast.error("Failed to load earnings");
      } finally {
        setLoading(false);
      }
    };

    loadEarnings();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500">Loading earnings…</div>
    );
  }

  if (!earnings) {
    return (
      <div className="py-24 text-center text-gray-500">
        No earnings data available
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* ===== HEADER ===== */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Earnings
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Your completed pickup earnings
        </p>
      </div>

      {/* ===== MAIN EARNINGS CARD ===== */}
      <div className="bg-white rounded-3xl p-8 shadow-sm space-y-6">
        <p className="text-sm text-gray-500">Total Earnings</p>

        <p className="text-5xl font-semibold text-gray-900 tracking-tight">
          ₹{earnings.totalEarnings?.toLocaleString("en-IN") || 0}
        </p>

        <div className="flex justify-between pt-6 border-t border-gray-100">
          <span className="text-sm text-gray-500">Completed Pickups</span>
          <span className="text-sm font-medium text-gray-900">
            {earnings.completedPickups || 0}
          </span>
        </div>
      </div>

      {/* ===== PAYOUT INFO CARD ===== */}
      <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Payout Details</h2>

        <p className="text-sm text-gray-600 leading-relaxed">
          ₹{earnings.totalEarnings || 0} earned from{" "}
          {earnings.completedPickups || 0} completed pickups.
        </p>

        {earnings.lastPayoutAt && (
          <p className="text-xs text-gray-400">
            Last calculated on{" "}
            {new Date(earnings.lastPayoutAt).toLocaleString()}
          </p>
        )}

        <p className="text-xs text-gray-400">Payouts are settled by admin.</p>
      </div>
    </div>
  );
};

export default Earnings;
