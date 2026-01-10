import { useSelector, useDispatch } from "react-redux";
import { updateOrderStatus } from "../../redux/slices/adminOrdersSlice";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.adminOrders.orders);

  const handleStatusChange = (orderId, status) => {
    dispatch(updateOrderStatus({ orderId, status }));
  };

  if (orders.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-20">No orders available</div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Orders</h1>

      {orders.map((order) => (
        <div
          key={order.orderId}
          className="bg-black/40 border border-white/10 rounded-xl p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-gray-400">Order ID</p>
              <p className="text-white font-semibold">{order.orderId}</p>
            </div>

            <select
              value={order.status || "pending"}
              onChange={(e) =>
                handleStatusChange(order.orderId, e.target.value)
              }
              className="bg-black border border-white/20 text-white px-3 py-2 rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div className="text-gray-300 text-sm space-y-1">
            <p>Total: ₹{order.total}</p>
            <p>Items: {order.items.length}</p>
            <p>Status: {order.status || "pending"}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminOrders;
