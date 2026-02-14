import { useEffect, useState, useMemo } from "react";
import API_BASE_URL from "../../config/api";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const RiderPerformance = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRider, setSelectedRider] = useState("all");
  const [month, setMonth] = useState(getCurrentMonth());

  const loadPerformance = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/admin/riders/performance`, {
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRiders(data.riders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformance();
  }, []);

  const riderNames = useMemo(() => {
    return riders.map((r) => r.riderName);
  }, [riders]);

  const filteredRiders = useMemo(() => {
    return riders.filter((r) => {
      const matchSearch = r.riderName
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchDropdown =
        selectedRider === "all" || r.riderName === selectedRider;

      return matchSearch && matchDropdown;
    });
  }, [riders, search, selectedRider]);

  const totals = useMemo(() => {
    return filteredRiders.reduce(
      (acc, r) => {
        acc.totalPickups += r.totalPickups || 0;
        acc.completed += r.completedPickups || 0;
        acc.rejected += r.rejectedPickups || 0;
        acc.earnings += r.totalEarnings || 0;
        return acc;
      },
      { totalPickups: 0, completed: 0, rejected: 0, earnings: 0 },
    );
  }, [filteredRiders]);

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            🛵 Rider Performance Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Track productivity, rejections & payouts.
          </p>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search rider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-white"
          />

          <select
            value={selectedRider}
            onChange={(e) => setSelectedRider(e.target.value)}
            className="bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-white"
          >
            <option value="all">All Riders</option>
            {riderNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <KPI label="Total Riders" value={riders.length} />
        <KPI label="Total Pickups" value={totals.totalPickups} />
        <KPI
          label="Completed"
          value={totals.completed}
          color="text-green-400"
        />
        <KPI label="Rejected" value={totals.rejected} color="text-red-400" />
        <KPI label="Total Earnings" value={`₹${totals.earnings}`} />
      </div>

      {/* TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-center">
          <thead className="bg-black/40 text-gray-400 uppercase text-xs tracking-wide">
            <tr>
              <th className="py-4 text-left pl-6">Rider</th>
              <th>Total</th>
              <th>Completed</th>
              <th>Rejected</th>
              <th>Rejection %</th>
              <th>Earnings</th>
            </tr>
          </thead>

          <tbody>
            {filteredRiders.map((r) => (
              <tr
                key={r._id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="py-4 pl-6 text-left text-white font-medium">
                  {r.riderName}
                </td>

                <td>{r.totalPickups}</td>
                <td className="text-green-400">{r.completedPickups}</td>
                <td className="text-red-400">{r.rejectedPickups}</td>

                <td>
                  <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold">
                    {r.rejectionRate?.toFixed(1)}%
                  </span>
                </td>

                <td>₹{r.totalEarnings}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && filteredRiders.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No rider data available.
          </div>
        )}
      </div>
    </div>
  );
};

const KPI = ({ label, value, color = "text-white" }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
    <p className="text-gray-400 text-sm">{label}</p>
    <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

export default RiderPerformance;
