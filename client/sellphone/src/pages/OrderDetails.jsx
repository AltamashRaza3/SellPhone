import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../utils/axios";
import { toast } from "react-hot-toast";
import OrderTimeline from "../components/OrderTimeline";
import OrderStatusBadge from "../components/OrderStatusBadge";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Loading order details…
      </div>
    );
  }

  /* ================= NOT FOUND ================= */
  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Order not found or access denied.
      </div>
    );
  }

  /* ================= CANCEL ORDER ================= */
  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const { data } = await axios.put(`/orders/${order._id}/cancel`);
      setOrder(data.order);
      toast.success("Order cancelled successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to cancel order");
    }
  };

  return (
    <div className="flex justify-center px-4 py-10 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen">
      <div className="w-full lg:w-[70%] max-w-6xl space-y-8">
        {/* BACK */}
        <Link to="/orders" className="text-sm text-orange-400 hover:underline">
          ← Back to My Orders
        </Link>

        <h1 className="text-3xl font-semibold text-white">Order Details</h1>

        {/* ================= ORDER INFO ================= */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="text-sm text-gray-300 space-y-1">
              <p>
                <span className="text-gray-400">Order ID:</span> {order._id}
              </p>
              <p>
                <span className="text-gray-400">Placed on:</span>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Status:</span>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          <OrderTimeline status={order.status} />

          {order.status === "Pending" && (
            <button
              onClick={handleCancelOrder}
              className="mt-4 inline-flex px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* ================= ITEMS ================= */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-white">Ordered Items</h2>

          {order.items.map((item, idx) => {
            const phone = item.phone;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 flex flex-col sm:flex-row gap-6"
              >
                <img
                  src={phone.image}
                  alt={phone.model}
                  className="w-24 h-24 object-contain rounded-xl border border-white/10 bg-black/20"
                />

                <div className="flex-1">
                  <p className="text-lg font-semibold text-white">
                    {phone.brand} {phone.model}
                  </p>

                  <div className="mt-2 space-y-1 text-sm text-gray-400">
                    {phone.color && <p>Color: {phone.color}</p>}
                    {phone.storage && <p>Storage: {phone.storage}</p>}
                    {phone.ram && <p>RAM: {phone.ram}</p>}
                  </div>
                </div>

                <div className="text-right text-sm text-gray-300 space-y-1">
                  <p>Qty: {item.quantity}</p>
                  <p>₹{phone.price}</p>
                  <p className="text-lg font-semibold text-white">
                    ₹{phone.price * item.quantity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 flex justify-between items-center">
          <span className="text-lg text-gray-300">Total Amount</span>
          <span className="text-2xl font-semibold text-white">
            ₹{order.totalAmount}
          </span>
        </div>

        {/* ================= INVOICE ================= */}
        <div className="flex justify-end">
          {order.status === "Delivered" ? (
            <a
              href={`${import.meta.env.VITE_API_BASE_URL}/api/invoices/order/${order._id}`}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium"
            >
              Download Invoice
            </a>
          ) : (
            <p className="text-sm text-gray-400">
              Invoice will be available after delivery
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
