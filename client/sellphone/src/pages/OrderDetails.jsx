import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const found = savedOrders.find((o) => o.orderId === id);

    if (!found) {
      navigate("/orders", { replace: true });
      return;
    }

    setOrder(found);
  }, [id, navigate]);

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">Order Details</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Order ID:</span>
          <span className="font-semibold">{order.orderId}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Total Paid:</span>
          <span className="font-bold">₹{order.total}</span>
        </div>

        <div>
          <h3 className="font-semibold mt-2 mb-1">Items</h3>
          {order.items.map((item) => (
            <div
              key={item.phone._id}
              className="flex justify-between text-sm mb-1"
            >
              <span>
                {item.phone.brand} {item.phone.model} × {item.quantity}
              </span>
              <span>₹{item.phone.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-semibold mt-2 mb-1">Delivery Address</h3>
          <p className="text-gray-600 text-sm">
            {order.address.name}, {order.address.address}, {order.address.city}{" "}
            – {order.address.pincode}
            <br />
            📞 {order.address.phone}
          </p>
        </div>

        <Link
          to="/orders"
          className="inline-block mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Back to Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderDetails;
