import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import OrderStatusBadge from "../components/OrderStatusBadge";
import noImage from "../assets/no-image.png";
import { resolveImageUrl } from "../utils/resolveImageUrl";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/orders/my");
        if (mounted) setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch orders", error);
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
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-sm">
        Loading your orders…
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (!orders.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-3xl font-semibold text-gray-900">No orders yet</h2>

        <p className="text-gray-500 mt-3 max-w-md">
          When you place your first order, it will appear here.
        </p>

        <Link
          to="/phones"
          className="mt-8 px-8 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-90 transition"
        >
          Browse Phones
        </Link>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="bg-[#f5f5f7] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
            My Orders
          </h1>
          <p className="text-gray-500 mt-3">
            Track your purchases and manage your orders.
          </p>
        </div>

        {/* LIST */}
        <div className="space-y-6">
          {orders.map((order) => {
            const firstItem = order.items?.[0];
            const product = firstItem?.productId;

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* LEFT SIDE */}
                  <div className="flex gap-5">
                    {product && (
                      <img
                        src={resolveImageUrl(product.images?.[0])}
                        alt={product.model}
                        className="w-20 h-20 object-contain rounded-2xl bg-gray-50 border border-gray-100"
                        onError={(e) => (e.currentTarget.src = noImage)}
                      />
                    )}

                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400">
                        Order #{order._id.slice(-6)}
                      </p>

                      <h3 className="text-lg font-semibold text-gray-900 mt-1">
                        {product?.brand} {product?.model}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {product?.color && `${product.color} • `}
                        {product?.storage}
                        {firstItem?.quantity > 1 &&
                          ` • Qty ${firstItem.quantity}`}
                      </p>

                      <p className="text-xs text-gray-400 mt-2">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex flex-col items-start md:items-end gap-3 md:gap-4">
                    <p className="text-xl font-semibold text-gray-900">
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </p>

                    <div className="w-fit">
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <Link
                      to={`/order/${order._id}`}
                      className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-medium shadow-sm hover:shadow-md transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
