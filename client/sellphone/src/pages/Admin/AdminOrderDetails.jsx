import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const AdminOrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/admin/orders/${id}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load order");
        }

        const data = await res.json();
        setOrder(data);
        setStatus(data.status);
      } catch (err) {
        toast.error(err.message || "Unable to fetch order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async () => {
    if (!status || updating) return;

    try {
      setUpdating(true);

      const res = await fetch(`http://localhost:5000/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      const updated = await res.json();
      setOrder(updated);
      setStatus(updated.status);

      toast.success("Order status updated");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return <p className="text-gray-400">Loading order…</p>;
  }

  if (!order) {
    return <p className="text-red-400">Order not found</p>;
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">Order #{order._id}</h1>
        <p className="text-gray-400">User: {order.user?.email}</p>
        <p className="text-gray-400">Total Amount: ₹{order.totalAmount}</p>
      </div>

      {/* ITEMS */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Order Items</h2>

        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item._id} className="flex justify-between text-gray-300">
              <span>
                {item.product?.brand} {item.product?.model} × {item.quantity}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STATUS CONTROL */}
      <div className="flex items-end gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Order Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-black border border-white/20 text-white px-4 py-2 rounded"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={updateStatus}
          disabled={updating}
          className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded text-white font-semibold disabled:opacity-50"
        >
          {updating ? "Updating..." : "Update Status"}
        </button>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
