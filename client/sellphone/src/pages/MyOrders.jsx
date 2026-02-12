import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import OrderStatusBadge from "../components/OrderStatusBadge";
import noImage from "../assets/no-image.png";
import { resolveImageUrl } from "../utils/resolveImageUrl";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */
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
    return () => (mounted = false);
  }, []);

  /* ================= FILTER + SEARCH ================= */
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) =>
        activeFilter === "All"
          ? true
          : order.status?.toLowerCase() === activeFilter.toLowerCase(),
      )
      .filter((order) => {
        const firstItem = order.items?.[0];
        const product = firstItem?.productId;
        const keyword = search.toLowerCase();

        return (
          product?.brand?.toLowerCase().includes(keyword) ||
          product?.model?.toLowerCase().includes(keyword) ||
          order._id?.slice(-6).toLowerCase().includes(keyword)
        );
      });
  }, [orders, activeFilter, search]);

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
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center bg-[#f5f5f7] px-6 space-y-8">
        <h2 className="text-4xl font-semibold tracking-tight text-gray-900">
          No orders yet
        </h2>

        <p className="text-gray-500 max-w-md leading-relaxed">
          When you place your first order, it will appear here.
        </p>

        <Link
          to="/phones"
          className="px-10 py-4 rounded-full bg-black text-white text-sm font-medium hover:scale-[1.03] transition"
        >
          Browse Phones
        </Link>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="bg-[#f5f5f7] min-h-screen py-24">
      {/* TRUE CENTER WRAPPER */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl px-6 flex flex-col items-center space-y-16">
          {/* HEADER */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
              My Orders
            </h1>
            <p className="text-gray-500 text-lg">
              Track your purchases and manage your orders.
            </p>
          </div>

          {/* SEARCH */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-md relative">
              <input
                type="text"
                placeholder="Search by brand, model, or order ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-6 py-3 rounded-full bg-white shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
              />
            </div>
          </div>

          {/* FILTER */}
          <div className="flex justify-center w-full">
            <div className="flex gap-4 bg-gray-100 p-2 rounded-full shadow-sm">
              {["All", "Pending", "Delivered", "Cancelled"].map((status) => {
                const isActive = activeFilter === status;

                return (
                  <button
                    key={status}
                    onClick={() => setActiveFilter(status)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-black text-white shadow-md"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARDS */}
          <div className="w-full flex flex-col items-center gap-10">
            {filteredOrders.map((order) => {
              const firstItem = order.items?.[0];
              const product = firstItem?.productId;

              return (
                <div
                  key={order._id}
                  className="w-full bg-white rounded-[36px] p-10 shadow-[0_25px_70px_rgba(0,0,0,0.05)] transition hover:shadow-[0_35px_90px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
                    {/* LEFT */}
                    <div className="flex gap-6 items-center">
                      {product && (
                        <div className="w-24 h-24 rounded-[24px] bg-[#fafafa] flex items-center justify-center">
                          <img
                            src={resolveImageUrl(product.images?.[0])}
                            alt={product.model}
                            className="w-20 h-20 object-contain"
                            onError={(e) => (e.currentTarget.src = noImage)}
                          />
                        </div>
                      )}

                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest text-gray-400">
                          Order #{order._id.slice(-6)}
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900">
                          {product?.brand} {product?.model}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {product?.color && `${product.color} • `}
                          {product?.storage}
                          {firstItem?.quantity > 1 &&
                            ` • Qty ${firstItem.quantity}`}
                        </p>

                        <p className="text-xs text-gray-400 pt-1">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-col items-start md:items-end gap-4">
                      <p className="text-2xl font-semibold text-gray-900">
                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                      </p>

                      <OrderStatusBadge status={order.status} />

                      <Link
                        to={`/order/${order._id}`}
                        className="px-8 py-3 rounded-full bg-black text-white text-sm font-medium hover:scale-[1.03] transition"
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
    </div>
  );
};

export default MyOrders;
