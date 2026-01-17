import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

        // 🔐 SAFETY: backend must return an array
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (Array.isArray(data?.orders)) {
          setOrders(data.orders);
        } else {
          console.error("Invalid admin orders response:", data);
          setOrders([]);
          setError("Failed to load orders");
        }
      } catch (err) {
        console.error("Admin orders fetch error:", err);
        setError("Server error while loading orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return <p className="text-gray-400">Loading orders...</p>;
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="text-red-400 bg-red-500/10 p-4 rounded-xl">{error}</div>
    );
  }

  /* ================= EMPTY ================= */
  if (orders.length === 0) {
    return (
      <div className="text-gray-400 text-center py-10">No orders found</div>
    );
  }

  /* ================= TABLE ================= */
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Orders</h1>

      <div className="overflow-x-auto bg-black/40 rounded-xl">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="px-4 py-3">{order._id.slice(-6)}</td>

                <td className="px-4 py-3">{order.user?.email || "Guest"}</td>

                <td className="px-4 py-3">₹{order.totalAmount}</td>

                <td className="px-4 py-3">{order.status}</td>

                <td className="px-4 py-3">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 py-3">
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="text-orange-400 hover:underline"
                  >
                    View
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
