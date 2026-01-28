import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import OrderStatusBadge from "../components/OrderStatusBadge";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/orders/my");
        if (mounted) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("❌ Failed to fetch orders", error);
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      mounted = false;
    };
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">Loading your orders…</div>
    );
  }

  /* ================= EMPTY ================= */
  if (!orders.length) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p className="mb-4">You have not placed any orders yet.</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm"
        >
          Browse Phones
        </Link>
      </div>
    );
  }

  /* ================= LIST ================= */
  return (
    
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex-1">
              <p className="text-sm text-gray-400">Order ID</p>
              <p className="font-mono text-xs break-all mb-2">{order._id}</p>

              {/* ORDER PREVIEW */}
              {order.items && order.items.length > 0 && (
                <div className="text-sm">
                  {(() => {
                    const firstItem = order.items[0];
                    const phone = firstItem.phone;

                    return (
                      <>
                        <div className="flex gap-3 items-start">
                          <img
                            src={phone.image}
                            alt={phone.model}
                            className="w-16 h-16 object-contain rounded-md border"
                          />

                          <div>
                            <p className="font-medium">
                              {phone.brand} {phone.model}
                            </p>

                            <p className="text-gray-400 text-xs mt-1">
                              {phone.color && `${phone.color} • `}
                              {phone.storage && phone.storage}
                              {firstItem.quantity > 1 &&
                                ` • Qty ${firstItem.quantity}`}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-400 text-xs mt-1">
                          {phone.color && `${phone.color} • `}
                          {phone.storage && phone.storage}
                          {firstItem.quantity > 1 &&
                            ` • Qty ${firstItem.quantity}`}
                        </p>

                        {order.items.length > 1 && (
                          <p className="text-xs text-gray-500 mt-1">
                            + {order.items.length - 1} more item
                            {order.items.length - 1 > 1 ? "s" : ""}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              <p className="mt-2 text-xs text-gray-400">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="text-sm space-y-1">
              <p>
                <span className="text-gray-400">Total:</span> ₹
                {order.totalAmount}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-400">Status:</span>
                <OrderStatusBadge status={order.status} />
              </p>
            </div>

            <Link
              to={`/order/${order._id}`}
              className="inline-block text-center px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
