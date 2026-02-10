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
      <div className="flex items-center justify-center py-24 text-zinc-400">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-400">Today’s overview</p>
      </div>

      {/* EARNINGS CARD */}
      {earnings && (
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-black shadow-xl">
          <p className="text-sm font-medium opacity-90">Total Earnings</p>
          <p className="text-4xl font-bold mt-1">₹{earnings.totalEarnings}</p>

          <div className="flex justify-between text-sm mt-5 opacity-90">
            <span>Completed Pickups</span>
            <span>{earnings.completedPickups}</span>
          </div>
        </div>
      )}

      {/* PICKUPS */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Assigned Pickups
        </h2>

        {pickups.length === 0 && (
          <div className="rounded-2xl bg-zinc-900 border border-white/10 p-6 text-center text-zinc-400">
            No pickups assigned yet
          </div>
        )}

        <div className="space-y-4">
          {pickups.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/pickups/${p._id}`)}
              className="rounded-2xl bg-zinc-900 border border-white/10 p-4 cursor-pointer hover:bg-zinc-800 transition active:scale-[0.98]"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold text-white">
                    {p.phone?.brand} {p.phone?.model}
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">
                    {p.pickup?.address?.line1}, {p.pickup?.address?.city}
                  </p>
                </div>

                <span className="shrink-0 text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-200 capitalize">
                  {p.pickup?.status}
                </span>
              </div>

              <p className="text-sm text-zinc-300 mt-4">
                Pickup scheduled:
                <br />
                <span className="font-medium">
                  {new Date(p.pickup?.scheduledAt).toLocaleString()}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pickups;
