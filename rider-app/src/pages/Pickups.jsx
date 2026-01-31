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
          setPickups(pickupsRes.value.data);
        } else {
          toast.error("Failed to load pickups");
        }

        if (earningsRes.status === "fulfilled") {
          setEarnings(earningsRes.value.data);
        }
      } catch (err) {
        toast.error("Dashboard failed to load");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-400">Today’s overview</p>
      </div>

      {earnings && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 p-5 text-black shadow-lg">
          <p className="text-sm font-medium opacity-90">Total Earnings</p>
          <p className="text-3xl font-bold mt-1">₹{earnings.totalEarnings}</p>

          <div className="flex justify-between text-sm mt-4 opacity-90">
            <span>Completed Pickups</span>
            <span>{earnings.completedPickups}</span>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          Assigned Pickups
        </h2>

        {pickups.length === 0 && (
          <p className="text-zinc-400 mt-8">No pickups assigned yet</p>
        )}

        <div className="space-y-4">
          {pickups.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/pickups/${p._id}`)}
              className="rounded-2xl bg-zinc-900 border border-white/10 p-4 cursor-pointer hover:bg-zinc-800 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-white">
                    {p.phone.brand} {p.phone.model}
                  </p>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    {p.pickup.address.line1}, {p.pickup.address.city}
                  </p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-200">
                  {p.pickup.status}
                </span>
              </div>

              <p className="text-sm text-zinc-300 mt-3">
                Pickup: {new Date(p.pickup.scheduledAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pickups;
