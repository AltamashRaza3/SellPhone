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
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(savedOrders);
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of SalePhone platform</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon="📦"
          gradient="bg-gradient-to-br from-orange-500 to-orange-700"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue}`}
          icon="💰"
          gradient="bg-gradient-to-br from-green-500 to-green-700"
        />
        <StatCard
          title="Users"
          value="124"
          icon="👤"
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        <StatCard
          title="Sell Requests"
          value="9"
          icon="🔁"
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-black/40 backdrop-blur rounded-2xl border border-white/10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
        </div>

        {orders.length === 0 ? (
          <p className="p-6 text-gray-400">No orders placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="p-4 text-left">Order ID</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Items</th>
                  <th className="p-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.orderId}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="p-4 font-medium">{order.orderId}</td>
                    <td className="p-4">₹{order.total}</td>
                    <td className="p-4">{order.items.length}</td>
                    <td className="p-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
