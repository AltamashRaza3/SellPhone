import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import API_BASE_URL from "../config/api";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate("/", { replace: true });
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error("Order not found");

        setOrder(data);
      } catch {
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-gray-400">
        Loading order details…
      </div>
    );
  }

  if (!order) return null;

  const a = order.shippingAddress;

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      {/* ================= SUCCESS HEADER ================= */}
      <div className="text-center space-y-6">
        <div className="mx-auto w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="text-green-500" size={48} />
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          Order Confirmed
        </h1>

        <p className="text-gray-500 max-w-md mx-auto text-base leading-relaxed">
          Your order has been placed successfully. We’re preparing your device
          and will notify you once it ships.
        </p>

        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-sm text-gray-600">
          Order ID:{" "}
          <span className="ml-2 font-medium text-gray-900">{order._id}</span>
        </div>
      </div>

      {/* ================= SUMMARY CARD ================= */}
      <div className="mt-16 bg-white border border-gray-100 rounded-3xl p-10 space-y-10">
        {/* DELIVERY */}
        <div>
          <h3 className="text-sm uppercase tracking-wide text-gray-400 mb-4">
            Delivery Address
          </h3>

          <p className="text-gray-700 leading-relaxed">
            {a.name}
            <br />
            {a.line1}
            <br />
            {a.city}, {a.state} – {a.pincode}
            <br />
            {a.phone}
          </p>
        </div>

        <div className="border-t border-gray-100" />

        {/* ITEMS */}
        <div className="space-y-6">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between items-start text-sm">
              <div className="text-gray-700">
                <div className="font-medium text-gray-900">
                  {item.productId?.brand} {item.productId?.model}
                </div>
                <div className="text-gray-400 mt-1">
                  Quantity: {item.quantity}
                </div>
              </div>

              <div className="font-medium text-gray-900">
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-6 flex justify-between text-xl font-semibold text-gray-900">
          <span>Total Paid</span>
          <span>₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-center gap-6 mt-16 flex-wrap">
        <Link
          to="/orders"
          className="px-10 py-4 rounded-full bg-black text-white font-medium text-sm hover:opacity-90 transition"
        >
          View My Orders
        </Link>

        <Link
          to="/phones"
          className="px-10 py-4 rounded-full border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-100 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
