import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrderStatusBadge from "../../components/OrderStatusBadge";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/orders", {
          credentials: "include",
        });

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid orders response");
        }

        setOrders(data);
      } catch (err) {
        console.error("Admin orders fetch error:", err);
        setError("Server error while loading orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-gray-400">
        Loading orders…
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-red-500/10 text-red-400 p-4 rounded-xl">
        {error}
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (orders.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">No orders found</div>
    );
  }

  /* ================= TABLE ================= */
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold text-white">Orders Management</h1>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b border-white/10">
            <tr>
              <th className="px-5 py-4">Order</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-t border-white/5 hover:bg-white/5 transition"
              >
                <td className="px-5 py-4 font-mono text-gray-200">
                  #{order._id.slice(-6)}
                </td>

                <td className="px-5 py-4 text-gray-300">
                  {order.user?.email || "Guest"}
                </td>

                <td className="px-5 py-4 font-medium text-white">
                  ₹{order.totalAmount}
                </td>

                <td className="px-5 py-4">
                  <OrderStatusBadge status={order.status} />
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
    </div>
  );
};

export default AdminOrders;
