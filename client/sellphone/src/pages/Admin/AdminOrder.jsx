import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import API_BASE_URL from "../../config/api";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE_URL}/api/admin/orders`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load orders");
        }

        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("ADMIN ORDERS ERROR:", err);
        toast.error(err.message || "Unable to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-400">
        Loading orders…
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (!orders.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-400">
        No orders found
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold text-white">Orders</h1>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-gray-400">
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
                className="border-t border-white/5 hover:bg-white/5"
              >
                <td className="px-5 py-4 font-mono">#{order._id?.slice(-6)}</td>

                <td className="px-5 py-4">{order.user?.email || "Guest"}</td>

                <td className="px-5 py-4 font-medium">
                  ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                </td>

                <td className="px-5 py-4">
                  <span className="capitalize">{order.status}</span>
                </td>

                <td className="px-5 py-4">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "—"}
                </td>

                <td className="px-5 py-4 text-right">
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="text-orange-400 hover:underline font-medium"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
