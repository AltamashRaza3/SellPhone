import { useEffect, useState } from "react";

const StatCard = ({ title, value, icon, gradient }) => (
  <div className={`rounded-2xl p-6 shadow-lg text-white ${gradient}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-80">{title}</p>
        <h2 className="text-3xl font-bold mt-1">{value}</h2>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    sellRequests: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, sellReqRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/orders", {
            credentials: "include",
          }),
          fetch("http://localhost:5000/api/admin/sell-requests", {
            credentials: "include",
          }),
        ]);

        const ordersData = await ordersRes.json();
        const sellData = await sellReqRes.json();

        const orders = Array.isArray(ordersData)
          ? ordersData
          : ordersData.orders || [];

        const totalRevenue = orders.reduce(
          (sum, o) => sum + (o.totalAmount || 0),
          0,
        );

        setStats({
          orders: orders.length,
          revenue: totalRevenue,
          sellRequests: sellData.length || 0,
        });
      } catch (err) {
        console.error("Dashboard load failed", err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Platform overview</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.orders}
          icon="📦"
          gradient="bg-gradient-to-br from-orange-500 to-orange-700"
        />
        <StatCard
          title="Revenue"
          value={`₹${stats.revenue}`}
          icon="💰"
          gradient="bg-gradient-to-br from-green-500 to-green-700"
        />
        <StatCard
          title="Sell Requests"
          value={stats.sellRequests}
          icon="🔁"
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
