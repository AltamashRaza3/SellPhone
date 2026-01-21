import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import riderApi from "../api/riderApi";

const Pickups = () => {
  const [pickups, setPickups] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([riderApi.get("/pickups"), riderApi.get("/earnings")])
      .then(([pickupsRes, earningsRes]) => {
        setPickups(pickupsRes.data);
        setEarnings(earningsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem("riderToken");
    localStorage.removeItem("riderProfile");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={logout}
          className="bg-gray-800 px-4 py-2 rounded-lg text-sm"
        >
          Logout
        </button>
      </div>

      {/* ================= EARNINGS CARD ================= */}
      {earnings && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl p-5 mb-6">
          <p className="text-sm opacity-90">Today’s Earnings</p>
          <p className="text-3xl font-bold mt-1">₹{earnings.totalEarnings}</p>

          <div className="flex justify-between text-sm mt-4 opacity-90">
            <span>Completed Pickups</span>
            <span>{earnings.totalPickups}</span>
          </div>

          <div className="flex justify-between text-xs mt-1 opacity-80">
            <span>Per Pickup</span>
            <span>₹{earnings.commissionPerPickup}</span>
          </div>
        </div>
      )}

      {/* ================= PICKUPS LIST ================= */}
      <h2 className="text-xl font-semibold mb-3">Assigned Pickups</h2>

      {pickups.length === 0 && (
        <p className="text-gray-400 mt-10">No pickups assigned yet</p>
      )}

      <div className="space-y-4">
        {pickups.map((p) => (
          <div
            key={p._id}
            onClick={() => navigate(`/pickups/${p._id}`)}
            className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">
                  {p.phone.brand} {p.phone.model}
                </p>
                <p className="text-sm text-gray-400">
                  {p.pickup.address.line1}, {p.pickup.address.city}
                </p>
              </div>

              <span className="text-xs bg-indigo-600 px-3 py-1 rounded-full">
                {p.pickup.status}
              </span>
            </div>

            <p className="text-sm text-gray-300 mt-2">
              Pickup: {new Date(p.pickup.scheduledAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pickups;
