import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { auth } from "../utils/firebase";
import { toast } from "react-hot-toast";
import OrderStatusBadge from "../components/OrderStatusBadge";

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

        const token = await currentUser.getIdToken();

        const res = await fetch("http://localhost:5000/api/orders/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error();

        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Loading orders…
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold text-white">No orders yet</h2>
        <p className="text-gray-400 mt-2">
          Start shopping to see your orders here
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl"
        >
          Browse Phones
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-10">
      {/* 🔥 THIS BOX IS WHAT CENTERS EVERYTHING */}
      <div className="w-full max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          My Orders
        </h1>

        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-black/40 border border-white/10 rounded-2xl p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-400">
                Order #{order._id.slice(-6)}
              </p>
              <p className="text-lg font-semibold text-white">
                ₹{order.totalAmount}
              </p>
              <div className="mt-2">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            <Link
              to={`/order/${order._id}`}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600"
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
