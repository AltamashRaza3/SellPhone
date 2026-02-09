import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
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
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Loading order…
      </div>
    );
  }

  if (!order) return null;

  const a = order.shippingAddress;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <CheckCircle className="mx-auto text-green-500" size={72} />

      <h1 className="text-3xl font-bold mt-4">Order Placed Successfully 🎉</h1>

      <p className="text-gray-600 mt-2">
        Thank you for shopping with{" "}
        <span className="font-semibold">SalePhone</span>
      </p>

      {/* ORDER INFO */}
      <div className="bg-white shadow-md rounded-2xl p-6 mt-8 text-left">
        <div className="flex justify-between mb-4">
          <span className="text-gray-500">Order ID</span>
          <span className="font-semibold">{order._id}</span>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Delivery Address</h3>
          <p className="text-sm text-gray-600">
            {a.name}
            <br />
            {a.line1}
            <br />
            {a.city}, {a.state} – {a.pincode}
            <br />
            📞 {a.phone}
          </p>
        </div>

        <hr className="my-4" />

        {/* ITEMS */}
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>
                {item.productId?.brand} {item.productId?.model} ×{" "}
                {item.quantity}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <hr className="my-4" />

        <div className="flex justify-between text-lg font-bold">
          <span>Total Paid</span>
          <span>₹{order.totalAmount}</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-center gap-4 mt-10 flex-wrap">
        <Link
          to="/"
          className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
        >
          Continue Shopping
        </Link>

        <Link
          to="/my-orders"
          className="px-6 py-3 rounded-full bg-black text-white font-medium hover:bg-gray-900"
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
