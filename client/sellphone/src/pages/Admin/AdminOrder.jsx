import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../config/api";

/* ================= STATUS BADGE ================= */
const statusStyles = {
  Pending: "bg-yellow-500/10 text-yellow-400",
  Processing: "bg-blue-500/10 text-blue-400",
  Delivered: "bg-green-500/10 text-green-400",
  Cancelled: "bg-red-500/10 text-red-400",
};

const StatusBadge = ({ status }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${
      statusStyles[status] || "bg-gray-500/10 text-gray-300"
    }`}
  >
    {status}
  </span>
);

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/api/admin/orders?page=1&limit=20`,
          { credentials: "include" },
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setPagination(data.pagination || null);
      } catch (err) {
        console.error("ADMIN ORDERS ERROR:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-400">
        Loading orders…
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-400">
        No orders found
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold text-white">Orders</h1>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-gray-300">
            <tr>
              <th className="px-5 py-4 text-left">Order</th>
              <th className="px-5 py-4 text-left">Customer</th>
              <th className="px-5 py-4 text-left">Total</th>
              <th className="px-5 py-4 text-left">Status</th>
              <th className="px-5 py-4 text-left">Date</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="px-5 py-4 font-mono text-gray-200">
                  #{order._id.slice(-6)}
                </td>

                <td className="px-5 py-4 text-gray-300">
                  {order.user?.email || "Guest"}
                </td>

                <td className="px-5 py-4 font-medium text-green-400">
                  ₹{order.totalAmount}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={order.status} />
                </td>

                <td className="px-5 py-4 text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                <td className="px-5 py-4 text-right">
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="text-orange-400 hover:text-orange-300 font-medium"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <p className="text-xs text-gray-400">
          Page {pagination.page} of {pagination.totalPages} •{" "}
          {pagination.totalOrders} total orders
        </p>
      )}
    </div>
  );
};

export default AdminOrders;
