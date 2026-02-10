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
      <div className="py-24 text-center text-zinc-400">Loading earnings…</div>
    );
  }

  if (!earnings) {
    return (
      <div className="py-24 text-center text-zinc-400">
        No earnings data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold text-white">Earnings</h1>
        <p className="text-sm text-zinc-400">Your completed pickup earnings</p>
      </div>

      {/* SUMMARY CARD */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-black shadow-xl">
        <p className="text-sm font-medium opacity-90">Total Earnings</p>
        <p className="text-4xl font-bold mt-1">
          ₹{earnings.totalEarnings?.toLocaleString("en-IN") || 0}
        </p>

        <div className="flex justify-between text-sm mt-5 opacity-90">
          <span>Completed Pickups</span>
          <span>{earnings.completedPickups || 0}</span>
        </div>
      </div>

      {/* PAYOUT INFO */}
      <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 space-y-2">
        <p className="font-medium text-white">Payout Details</p>

        <p className="text-sm text-zinc-400">
          ₹{earnings.totalEarnings || 0} earned from{" "}
          {earnings.completedPickups || 0} completed pickups.
        </p>

        {earnings.lastPayoutAt && (
          <p className="text-xs text-zinc-500">
            Last calculated on{" "}
            {new Date(earnings.lastPayoutAt).toLocaleString()}
          </p>
        )}

        <p className="text-xs text-zinc-500">Payouts are settled by admin.</p>
      </div>
    </div>
  );
};

export default Earnings;
