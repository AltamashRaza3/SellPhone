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

      <h1 className="text-3xl font-semibold mt-4 text-gray-900">
        Order Placed Successfully
      </h1>

      <p className="text-gray-600 mt-2">
        Thank you for shopping with{" "}
        <span className="font-medium">SalePhone</span>
      </p>

      {/* ORDER INFO */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-8 text-left">
        <div className="flex justify-between mb-4 text-sm">
          <span className="text-gray-500">Order ID</span>
          <span className="font-medium text-gray-900">{order._id}</span>
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-1 text-gray-900">Delivery Address</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {a.name}
            <br />
            {a.line1}
            <br />
            {a.city}, {a.state} – {a.pincode}
            <br />
            📞 {a.phone}
          </p>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* ITEMS */}
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.productId?.brand} {item.productId?.model} ×{" "}
                {item.quantity}
              </span>
              <span className="text-gray-900">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="flex justify-between text-lg font-semibold text-gray-900">
          <span>Total Paid</span>
          <span>₹{order.totalAmount}</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-center gap-4 mt-10 flex-wrap">
        <Link
          to="/orders"
          className="px-6 py-3 rounded-xl bg-[#1E6BFF] hover:bg-[#1557D6] text-white font-medium"
        >
          View My Orders
        </Link>

        <Link
          to="/"
          className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
