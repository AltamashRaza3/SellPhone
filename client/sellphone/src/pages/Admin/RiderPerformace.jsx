import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";

const RiderPerformance = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPerformance = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/riders/performance`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setRiders(data.riders);
    } catch (err) {
      console.error("Failed to load performance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformance();
  }, []);

  if (loading)
    return <div className="text-gray-400">Loading performance...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-white">
        📈 Rider Performance
      </h2>

      {riders.length === 0 && (
        <div className="text-gray-400">No performance data yet.</div>
      )}

      <div className="grid gap-6">
        {riders.map((rider) => (
          <div
            key={rider._id}
            className="bg-white/5 backdrop-blur border border-white/10 p-6 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {rider.riderName || "Unknown Rider"}
              </h3>

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  rider.rejectionRate > 40
                    ? "bg-red-600 text-white"
                    : rider.rejectionRate > 20
                      ? "bg-yellow-600 text-white"
                      : "bg-green-600 text-white"
                }`}
              >
                {rider.rejectionRate.toFixed(1)}% Rejection
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-gray-400">Total</p>
                <p className="text-white font-semibold">{rider.totalPickups}</p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-gray-400">Completed</p>
                <p className="text-green-400 font-semibold">
                  {rider.completedPickups}
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-gray-400">Rejected</p>
                <p className="text-red-400 font-semibold">
                  {rider.rejectedPickups}
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-gray-400">Earnings</p>
                <p className="text-white font-semibold">
                  ₹{rider.totalEarnings}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiderPerformance;
