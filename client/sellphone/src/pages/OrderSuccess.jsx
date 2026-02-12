import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import API_BASE_URL from "../config/api";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError(true);
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) throw new Error("Order not found");

        setOrder(data.order || data);
      } catch (err) {
        console.error("Order fetch failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f5f5f7] text-gray-400">
        Loading order details…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f5f5f7] space-y-6 text-center">
        <h2 className="text-3xl font-semibold text-gray-900">
          Unable to load order
        </h2>
        <Link
          to="/"
          className="px-8 py-4 rounded-full bg-black text-white font-medium hover:scale-[1.02] transition"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const a = order.shippingAddress;

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-24">
      <div className="max-w-4xl mx-auto px-6 space-y-24">
        {/* ================= SUCCESS HEADER ================= */}
        <div className="text-center space-y-8">
          <div className="mx-auto w-28 h-28 rounded-full bg-green-50 flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
            <CheckCircle2 className="text-green-500" size={56} />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
              Order Confirmed
            </h1>

            <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
              Thank you for your purchase. Your device is being prepared and
              will be shipped soon.
            </p>
          </div>

          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)] text-sm text-gray-600">
            Order ID:
            <span className="ml-3 font-medium text-gray-900 break-all">
              {order._id}
            </span>
          </div>
        </div>

        {/* ================= ORDER DETAILS ================= */}
        <div className="bg-white rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.06)] p-14 space-y-14">
          {/* DELIVERY */}
          <div>
            <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-6">
              Delivery Address
            </h3>

            <p className="text-gray-700 text-base leading-relaxed">
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
          <div className="space-y-8">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-medium text-gray-900">
                    {item.productId?.brand} {item.productId?.model}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Quantity: {item.quantity}
                  </div>
                </div>

                <div className="text-lg font-medium text-gray-900">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-8 flex justify-between text-2xl font-semibold text-gray-900">
            <span>Total Paid</span>
            <span>₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex justify-center gap-8 flex-wrap">
          <Link
            to="/orders"
            className="px-10 py-4 rounded-full bg-black text-white font-medium hover:scale-[1.02] transition"
          >
            View My Orders
          </Link>

          <Link
            to="/phones"
            className="px-10 py-4 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
