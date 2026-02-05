import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../utils/api";

const LIMIT = 10;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/api/admin/orders?page=${page}&limit=${LIMIT}`,
          { credentials: "include" },
        );

        const data = await res.json();

        if (!res.ok) throw new Error("Failed to load orders");

        setOrders(data.orders || []);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-400">
        Loading orders…
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold text-white">Orders</h1>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-gray-400">
            <tr>
              <th className="px-5 py-4">Order</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-t border-white/5 hover:bg-white/5"
              >
                <td className="px-5 py-4 font-mono">#{order._id.slice(-6)}</td>
                <td className="px-5 py-4">{order.user?.email || "Guest"}</td>
                <td className="px-5 py-4 font-medium">₹{order.totalAmount}</td>
                <td className="px-5 py-4">{order.status}</td>
                <td className="px-5 py-4">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="text-orange-400 hover:underline"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pagination && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded bg-white/10 disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-gray-400 text-sm flex items-center">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded bg-white/10 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
