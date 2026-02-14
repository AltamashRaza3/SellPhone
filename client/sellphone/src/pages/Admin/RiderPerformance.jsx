import { useEffect, useState, useMemo } from "react";
import API_BASE_URL from "../../config/api";

const RiderPerformance = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minEarnings, setMinEarnings] = useState(0);

  /* ================= LOAD DATA ================= */
  const loadPerformance = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/riders/performance`, {
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRiders(data.riders || []);
      }
    } catch (err) {
      console.error("Performance load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformance();
  }, []);

  /* ================= FILTERED RIDERS ================= */
  const filteredRiders = useMemo(() => {
    return riders.filter((rider) => (rider.totalEarnings || 0) >= minEarnings);
  }, [riders, minEarnings]);

  /* ================= GLOBAL TOTALS ================= */
  const totals = useMemo(() => {
    return filteredRiders.reduce(
      (acc, rider) => {
        acc.totalPickups += rider.totalPickups || 0;
        acc.completed += rider.completedPickups || 0;
        acc.rejected += rider.rejectedPickups || 0;
        acc.earnings += rider.totalEarnings || 0;
        return acc;
      },
      { totalPickups: 0, completed: 0, rejected: 0, earnings: 0 },
    );
  }, [filteredRiders]);

  if (loading) {
    return (
      <div className="text-gray-400 text-lg">Loading Rider Performance...</div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            🛵 Rider Performance Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Monitor rider efficiency, rejection rates, and payouts.
          </p>
        </div>

        {/* ================= EARNINGS FILTER ================= */}
        <div>
          <label className="text-gray-400 text-sm block mb-2">
            Filter by Minimum Earnings
          </label>
          <select
            value={minEarnings}
            onChange={(e) => setMinEarnings(Number(e.target.value))}
            className="bg-black/40 border border-white/10 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value={0}>All Riders</option>
            <option value={500}>₹500+</option>
            <option value={1000}>₹1,000+</option>
            <option value={3000}>₹3,000+</option>
            <option value={5000}>₹5,000+</option>
          </select>
        </div>
      </div>

      {/* ================= KPI SUMMARY ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <p className="text-gray-400 text-sm">Total Pickups</p>
          <p className="text-2xl font-bold text-white">{totals.totalPickups}</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <p className="text-gray-400 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-400">
            {totals.completed}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <p className="text-gray-400 text-sm">Rejected</p>
          <p className="text-2xl font-bold text-red-400">{totals.rejected}</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <p className="text-gray-400 text-sm">Total Earnings</p>
          <p className="text-2xl font-bold text-white">
            ₹{totals.earnings.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ================= RIDER CARDS ================= */}
      {filteredRiders.length === 0 ? (
        <div className="text-gray-400">
          No riders match this earnings filter.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRiders.map((rider) => {
            const rejectionRate = rider.rejectionRate || 0;

            return (
              <div
                key={rider._id}
                className="bg-white/5 backdrop-blur border border-white/10 p-6 rounded-2xl transition hover:border-orange-500/40"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    {rider.riderName || "Unknown Rider"}
                  </h3>

                  <span
                    className={`text-xs px-4 py-1 rounded-full font-medium ${
                      rejectionRate > 40
                        ? "bg-red-600 text-white"
                        : rejectionRate > 20
                          ? "bg-yellow-600 text-white"
                          : "bg-green-600 text-white"
                    }`}
                  >
                    {rejectionRate.toFixed(1)}% Rejection
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-black/30 p-4 rounded-xl">
                    <p className="text-gray-400">Total</p>
                    <p className="text-white font-semibold">
                      {rider.totalPickups}
                    </p>
                  </div>

                  <div className="bg-black/30 p-4 rounded-xl">
                    <p className="text-gray-400">Completed</p>
                    <p className="text-green-400 font-semibold">
                      {rider.completedPickups}
                    </p>
                  </div>

                  <div className="bg-black/30 p-4 rounded-xl">
                    <p className="text-gray-400">Rejected</p>
                    <p className="text-red-400 font-semibold">
                      {rider.rejectedPickups}
                    </p>
                  </div>

                  <div className="bg-black/30 p-4 rounded-xl">
                    <p className="text-gray-400">Earnings</p>
                    <p className="text-white font-semibold">
                      ₹{(rider.totalEarnings || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiderPerformance;
