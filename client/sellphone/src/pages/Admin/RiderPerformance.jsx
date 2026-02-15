import { useEffect, useState, useMemo } from "react";
import API_BASE_URL from "../../config/api";

/* ================= MONTH GENERATOR ================= */
const generateLast12Months = () => {
  const months = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    const label = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    months.push({ value, label });
  }

  return months;
};

const getPreviousMonth = (month) => {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const RiderPerformance = () => {
  const monthsList = generateLast12Months();

  const [month, setMonth] = useState(monthsList[0].value);
  const [riders, setRiders] = useState([]);
  const [prevMonthRiders, setPrevMonthRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedRider, setSelectedRider] = useState("all");

  /* ================= LOAD MONTH DATA ================= */
  const loadData = async () => {
    try {
      setLoading(true);

      const prevMonth = getPreviousMonth(month);

      const [currentRes, prevRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/admin/riders/performance/monthly?month=${month}`,
          { credentials: "include" },
        ),
        fetch(
          `${API_BASE_URL}/api/admin/riders/performance/monthly?month=${prevMonth}`,
          { credentials: "include" },
        ),
      ]);

      const currentData = await currentRes.json();
      const prevData = await prevRes.json();

      if (currentData.success) setRiders(currentData.riders || []);
      if (prevData.success) setPrevMonthRiders(prevData.riders || []);
    } catch (err) {
      console.error("Performance load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [month]);

  /* ================= FILTER ================= */
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

  /* ================= TOTALS ================= */
  const totals = useMemo(() => {
    return filteredRiders.reduce(
      (acc, r) => {
        acc.assigned += r.totalPickups || 0;
        acc.completed += r.completedPickups || 0;
        acc.rejected += r.rejectedPickups || 0;
        acc.earnings += r.totalEarnings || 0;
        return acc;
      },
      { assigned: 0, completed: 0, rejected: 0, earnings: 0 },
    );
  }, [filteredRiders]);

  /* ================= PREVIOUS MONTH TOTAL ================= */
  const prevMonthTotal = useMemo(() => {
    return prevMonthRiders.reduce((acc, r) => acc + (r.totalEarnings || 0), 0);
  }, [prevMonthRiders]);

  const earningsGrowth =
    prevMonthTotal === 0
      ? 0
      : ((totals.earnings - prevMonthTotal) / prevMonthTotal) * 100;

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            🛵 Rider Performance Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Showing performance for{" "}
            <span className="text-orange-400 font-semibold">
              {monthsList.find((m) => m.value === month)?.label}
            </span>
          </p>
        </div>

        <div className="flex gap-4 flex-wrap">
          {/* Month Dropdown */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-black/50 border border-white/20 px-4 py-2 rounded-xl text-white"
          >
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search rider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-black/50 border border-white/20 px-4 py-2 rounded-xl text-white"
          />

          <select
            value={selectedRider}
            onChange={(e) => setSelectedRider(e.target.value)}
            className="bg-black/50 border border-white/20 px-4 py-2 rounded-xl text-white"
          >
            <option value="all">All Riders</option>
            {riders.map((r) => (
              <option key={r._id} value={r.riderName}>
                {r.riderName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <KPI label="Total Riders" value={filteredRiders.length} />

        <KPI label="Assigned" value={totals.assigned} color="text-blue-400" />

        <KPI
          label="Completed"
          value={totals.completed}
          color="text-green-400"
        />

        <KPI label="Rejected" value={totals.rejected} color="text-red-400" />

        <KPI
          label="Earnings"
          value={`₹${totals.earnings.toLocaleString()}`}
          color="text-orange-400"
          growth={earningsGrowth}
        />
      </div>

      {/* TABLE */}
      <div className="bg-black/50 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black text-gray-400 uppercase text-xs tracking-wide">
            <tr>
              <th className="py-4 text-left pl-6">Rider</th>
              <th className="text-center">Assigned</th>
              <th className="text-center">Completed</th>
              <th className="text-center">Rejected</th>
              <th className="text-center">Rejection %</th>
              <th className="text-center">Earnings</th>
            </tr>
          </thead>

          <tbody>
            {filteredRiders.map((r) => (
              <tr
                key={r._id}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="py-4 pl-6 text-white font-semibold">
                  {r.riderName}
                </td>

                <td className="text-center text-blue-400 font-bold">
                  {r.totalPickups}
                </td>

                <td className="text-center text-green-400 font-bold">
                  {r.completedPickups}
                </td>

                <td className="text-center text-red-400 font-bold">
                  {r.rejectedPickups}
                </td>

                <td className="text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold min-w-[70px]">
                    {r.rejectionRate?.toFixed(1)}%
                  </span>
                </td>

                <td className="text-center text-orange-400 font-bold">
                  ₹{(r.totalEarnings || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* KPI CARD */
const KPI = ({ label, value, color = "text-white", growth }) => (
  <div className="bg-black/60 border border-white/10 p-6 rounded-2xl text-center shadow-lg">
    <p className="text-gray-400 text-sm">{label}</p>
    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>

    {growth !== undefined && (
      <p
        className={`text-sm mt-2 ${
          growth >= 0 ? "text-green-400" : "text-red-400"
        }`}
      >
        {growth >= 0 ? "↑" : "↓"} {growth.toFixed(1)}% vs last month
      </p>
    )}
  </div>
);

export default RiderPerformance;
