import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(savedOrders.reverse());
  }, []);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
        <CheckCircle size={72} className="text-gray-300" />
        <h2 className="text-2xl font-bold">No Orders Yet</h2>
        <p className="text-gray-500">
          Looks like you haven't placed any orders yet.
        </p>
        <Link
          to="/"
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-16 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">My Orders</h1>
      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => (
          <div
            key={order.orderId}
            className="bg-white rounded-xl shadow-lg p-6 space-y-3 hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">
                Order ID
              </span>
              <span className="font-bold text-gray-800 text-sm">
                {order.orderId}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Amount</span>
              <span className="font-bold text-xl text-orange-600">
                ₹{order.totalAmount}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Items</span>
              <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-sm">
                {order.items.length} item(s)
              </span>
            </div>

            <Link
              to={`/order/${order.orderId}`}
              className="mt-4 w-full block bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-xl text-center shadow-md hover:shadow-lg transition-all duration-300 text-sm"
            >
              View Order Details →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
