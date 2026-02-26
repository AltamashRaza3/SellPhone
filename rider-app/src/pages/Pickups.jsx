import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import riderApi from "../api/riderApi";
import { toast } from "react-hot-toast";

const Pickups = () => {
  const [pickups, setPickups] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [pickupsRes, earningsRes] = await Promise.allSettled([
          riderApi.get("/pickups"),
          riderApi.get("/earnings"),
        ]);

        if (pickupsRes.status === "fulfilled") {
          setPickups(pickupsRes.value.data || []);
        } else {
          toast.error("Failed to load pickups");
        }

        if (earningsRes.status === "fulfilled") {
          setEarnings(earningsRes.value.data);
        }
      } catch {
        toast.error("Dashboard failed to load");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 text-sm">
        Loading pickups…
      </div>
    );
  }
// const statusPriority = {
//   Scheduled: 1,
//   Picked: 2,
//   Completed: 3,
//   Rejected: 4,
// };

// const sortedPickups = [...pickups].sort((a, b) => {
//   const aPriority = statusPriority[a.pickup?.status] ?? 99;
//   const bPriority = statusPriority[b.pickup?.status] ?? 99;

//   if (aPriority !== bPriority) {
//     return aPriority - bPriority;
//   }

//   return new Date(a.pickup?.scheduledAt) - new Date(b.pickup?.scheduledAt);
// });

  return (
    <div className="space-y-16">
      {/* ===== Header ===== */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Pickups
        </h1>
        <p className="text-sm text-gray-500 mt-3">Today’s assignments</p>
      </div>

      {/* ===== Earnings Card ===== */}
      {earnings && (
        <div className="bg-white rounded-[28px] px-8 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Total Earnings
          </p>

          <p className="text-5xl font-semibold text-gray-900 mt-4">
            ₹{earnings.totalEarnings?.toLocaleString("en-IN")}
          </p>

          <div className="flex justify-between items-center text-sm text-gray-500 mt-8 pt-6 border-t border-gray-100">
            <span>Completed Pickups</span>
            <span className="text-gray-900 font-medium">
              {earnings.completedPickups}
            </span>
          </div>
        </div>
      )}

      {/* ===== Pickup List ===== */}
      <div className="space-y-10">
        <h2 className="text-lg font-semibold text-gray-900">
          Assigned Pickups
        </h2>

        {pickups.length === 0 && (
          <div className="bg-white rounded-[28px] p-12 text-center text-gray-500 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            No pickups assigned yet
          </div>
        )}

        {sortedPickups.map((p) => {
          const status = p.pickup?.status;

          const statusStyles =
            status === "Completed"
              ? "bg-green-50 text-green-600"
              : status === "Scheduled"
                ? "bg-blue-50 text-blue-600"
                : status === "Picked"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-gray-100 text-gray-600";

          return (
            <div
              key={p._id}
              onClick={() => navigate(`/pickups/${p._id}`)}
              className="
                bg-white rounded-[28px] p-8
                shadow-[0_10px_40px_rgba(0,0,0,0.05)]
                hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                transition-all duration-300
                cursor-pointer
              "
            >
              <div className="flex justify-between items-start gap-6">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {p.phone?.brand} {p.phone?.model}
                  </p>

                  <p className="text-sm text-gray-500 mt-3 leading-relaxed max-w-[80%]">
                    {p.pickup?.address?.line1}, {p.pickup?.address?.city}
                  </p>
                </div>

                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-medium ${statusStyles}`}
                >
                  {status}
                </span>
              </div>

              <div className="mt-8 text-sm text-gray-500">
                Pickup scheduled
                <br />
                <span className="text-gray-900 font-medium">
                  {new Date(p.pickup?.scheduledAt).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pickups;
