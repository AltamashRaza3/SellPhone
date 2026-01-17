import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { auth } from "../utils/firebase";
import { toast } from "react-hot-toast";

const Orders = () => {
  const user = useSelector((state) => state.user.user);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          toast.error("Session expired. Please login again.");
          return;
        }

        // 🔑 REQUIRED
        const token = await currentUser.getIdToken();

        const res = await fetch("http://localhost:5000/api/orders/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load orders");

        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Orders fetch error:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  /* ================= LOADING ================= */
  if (loading) {
    return <p className="text-gray-400 text-center">Loading orders...</p>;
  }

  /* ================= EMPTY ================= */
  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-300">No orders yet</h2>
        <p className="text-gray-500 mt-2">
          Start shopping to see your orders here
        </p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl"
        >
          Browse Phones
        </Link>
      </div>
    );
  }

  /* ================= LIST ================= */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">My Orders</h1>

      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-black/40 border border-white/10 p-4 rounded-xl"
        >
          <p className="text-sm text-gray-400">Order #{order._id.slice(-6)}</p>
          <p className="text-white font-semibold">
            Total: ₹{order.totalAmount}
          </p>
          <p className="text-gray-400">Status: {order.status}</p>

          <Link
            to={`/order/${order._id}`}
            className="text-orange-400 hover:underline mt-2 inline-block"
          >
            View Details →
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Orders;
