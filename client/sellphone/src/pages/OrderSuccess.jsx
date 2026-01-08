import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("latestOrder");

    if (!savedOrder) {
      navigate("/", { replace: true });
      return;
    }

    setOrder(JSON.parse(savedOrder));
    localStorage.removeItem("latestOrder");
  }, [navigate]);

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      {/* Success Icon */}
      <CheckCircle className="mx-auto text-green-500" size={72} />

      <h1 className="text-3xl font-bold mt-4">Order Placed Successfully 🎉</h1>
      <p className="text-gray-600 mt-2">
        Thank you for shopping with{" "}
        <span className="font-semibold">SalePhone</span>
      </p>

      {/* Order Info */}
      <div className="bg-white shadow-md rounded-2xl p-6 mt-8 text-left">
        <div className="flex justify-between mb-4">
          <span className="text-gray-500">Order ID</span>
          <span className="font-semibold">{order.orderId}</span>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Delivery Address</h3>
          <p className="text-sm text-gray-600">
            {order.address.name}, {order.address.address}, {order.address.city}{" "}
            – {order.address.pincode}
            <br />
            📞 {order.address.phone}
          </p>
        </div>

        <hr className="my-4" />

        {/* Items */}
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.phone._id} className="flex justify-between text-sm">
              <span>
                {item.phone.brand} {item.phone.model} × {item.quantity}
              </span>
              <span>₹{Number(item.phone.price) * item.quantity}</span>
            </div>
          ))}
        </div>

        <hr className="my-4" />

        <div className="flex justify-between text-lg font-bold">
          <span>Total Paid</span>
          <span>₹{order.total}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 mt-10 flex-wrap">
        <Link
          to="/"
          className="px-6 py-3 rounded-full border border-orange-500 text-orange-500 font-medium hover:bg-orange-50"
        >
          Continue Shopping
        </Link>

        <Link
          to="/sale"
          className="px-6 py-3 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600"
        >
          Sell Phone
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
