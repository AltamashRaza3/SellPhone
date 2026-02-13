import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { getAuth } from "firebase/auth";
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

    const auth = getAuth();

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) throw new Error("User not authenticated");

        const token = await user.getIdToken(true);

        const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed with status ${res.status}`);
        }

        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Order fetch failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] grid place-items-center bg-[#f5f5f7] text-gray-500">
        Loading order details…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[100dvh] grid place-items-center bg-[#f5f5f7] text-center space-y-6">
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
    <div className="relative min-h-[100dvh] grid place-items-center overflow-hidden bg-[#f5f5f7]">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-1/2 left-1/2 w-[900px] h-[900px]
                        -translate-x-1/2 -translate-y-1/2
                        bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200
                        opacity-40 blur-3xl rounded-full"
        />
      </div>

      {/* Slight Upward Visual Balance */}
      <div className="w-full max-w-3xl px-6 py-16 space-y-16 -translate-y-12">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div
            className="w-24 h-24 rounded-full bg-white/60 backdrop-blur-md
                          flex items-center justify-center shadow-xl
                          border border-white/40"
          >
            <CheckCircle2 className="text-green-500" size={48} />
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
            Order Confirmed
          </h1>

          <div className="max-w-lg">
            <p className="text-gray-500 leading-relaxed text-center">
              Thank you for your purchase. Your device is being prepared and
              will be shipped soon.
            </p>
          </div>

          <div
            className="inline-flex items-center px-5 py-2 rounded-full
                          bg-white/70 backdrop-blur-md border border-white/40
                          shadow text-sm text-gray-700"
          >
            Order ID:
            <span className="ml-2 font-medium text-gray-900 break-all">
              {order._id}
            </span>
          </div>
        </div>

        {/* Glass Order Card */}
        <div
          className="bg-white/60 backdrop-blur-2xl border border-white/40
                        rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.08)]
                        p-10 space-y-10"
        >
          <div>
            <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-4">
              Delivery Address
            </h3>

            <p className="text-gray-800 leading-relaxed">
              {a.name}
              <br />
              {a.line1}
              <br />
              {a.city}, {a.state} – {a.pincode}
              <br />
              {a.phone}
            </p>
          </div>

          <div className="border-t border-white/40" />

          <div className="space-y-6">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-medium text-gray-900">
                    {item.productId?.brand} {item.productId?.model}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Quantity: {item.quantity}
                  </div>
                </div>

                <div className="text-lg font-semibold text-gray-900">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/40 pt-6 flex justify-between text-xl font-semibold text-gray-900">
            <span>Total Paid</span>
            <span>₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-6 flex-wrap">
          <Link
            to="/orders"
            className="px-8 py-3 rounded-full bg-black text-white font-medium hover:scale-[1.02] transition"
          >
            View My Orders
          </Link>

          <Link
            to="/phones"
            className="px-8 py-3 rounded-full border border-gray-300 text-gray-800 font-medium hover:bg-white/40 backdrop-blur-md transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
