import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import API_BASE_URL from "../../config/api";

import AdminOrderTimeline from "../../components/AdminOrderTimeline";
import AdminOrderStatusHistory from "../../components/AdminOrderStatusHistory";

/* ======================================================
   Backend-safe status transitions
====================================================== */
const TRANSITIONS = {
  Pending: ["Processing"],
  Processing: ["Shipped"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const AdminOrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/orders/${id}`, {
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load order");

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

  /* ================= ALLOWED STATUSES ================= */
  const allowedStatuses = useMemo(() => {
    if (!order) return [];
    return TRANSITIONS[order.status] || [];
  }, [order]);

  const statusLocked =
    order?.status === "Delivered" || order?.status === "Cancelled";

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async () => {
    if (!status || updating || status === order.status) return;

    try {
      setUpdating(true);

      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      const updatedOrder = data.order || data;
      setOrder(updatedOrder);
      setStatus(updatedOrder.status);

      toast.success("Order status updated");
    } catch (err) {
      toast.error(err.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  /* ================= DOWNLOAD INVOICE ================= */
  const downloadInvoice = async () => {
    if (!order || downloading) return;

    try {
      setDownloading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/invoices/admin/order/${order._id}`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Invoice download failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${order.invoiceNumber || "invoice"}.pdf`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloading(false);
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Loading order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-400">
        Order not found
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Link
        to="/admin/orders"
        className="text-sm text-orange-400 hover:underline"
      >
        ← Back to Orders
      </Link>

      {/* HEADER */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-2">
        <h1 className="text-2xl font-bold text-white">Order #{order._id}</h1>
        <p className="text-gray-400">User: {order.user?.email || "Guest"}</p>
        <p className="text-gray-400">Total: ₹{order.totalAmount}</p>
        <p className="text-gray-400">Status: {order.status}</p>
      </div>

      {/* CUSTOMER + ADDRESS */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* CUSTOMER DETAILS */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Customer Details
          </h2>

          <div className="space-y-2 text-sm">
            <p className="text-gray-400">
              Name:
              <span className="text-white font-medium ml-2">
                {order.user?.name || "Guest User"}
              </span>
            </p>

            <p className="text-gray-400">
              Email:
              <span className="text-white font-medium ml-2">
                {order.user?.email || "N/A"}
              </span>
            </p>

            <p className="text-gray-400">
              Phone:
              <span className="text-white font-medium ml-2">
                {order.phone ||
                  order.shippingAddress?.phone ||
                  order.address?.phone ||
                  "N/A"}
              </span>
            </p>

            <p className="text-gray-400">
              Order Date:
              <span className="text-white font-medium ml-2">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* DELIVERY ADDRESS */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Delivery Address
          </h2>

          <p className="text-sm text-gray-300 leading-relaxed">
            {order.shippingAddress?.fullName && (
              <span className="font-medium text-white">
                {order.shippingAddress.fullName}
                <br />
              </span>
            )}

            {order.shippingAddress?.addressLine1 ||
              order.address?.street ||
              "—"}
            <br />

            {order.shippingAddress?.city || order.address?.city || ""}

            {order.shippingAddress?.state && `, ${order.shippingAddress.state}`}
            <br />

            {order.shippingAddress?.pincode || order.address?.pincode || ""}
          </p>
        </div>
      </div>

      <AdminOrderTimeline order={order} />
      <AdminOrderStatusHistory history={order.statusHistory} />

      {/* ITEMS */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Ordered Items</h2>

        <div className="space-y-4">
          {order.items.map((item, index) => {
            const phone = item.productId || {};

            return (
              <div
                key={index}
                className="flex justify-between border-b border-white/10 pb-3"
              >
                <div>
                  <p className="font-medium text-white">
                    {phone.brand} {phone.model}
                  </p>
                  <p className="text-sm text-gray-400">
                    {phone.color && `Color: ${phone.color} · `}
                    {phone.storage && `Storage: ${phone.storage}`}
                  </p>
                  <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                </div>

                <div className="text-right">
                  <p className="text-gray-400">₹{item.price}</p>
                  <p className="font-semibold text-white">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 flex flex-col sm:flex-row sm:items-end gap-4">
        {!statusLocked && (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Update Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-black/40 border border-white/20 text-white px-4 py-2 rounded-lg"
              >
                <option value={order.status} disabled>
                  {order.status}
                </option>
                {allowedStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={updateStatus}
              disabled={updating || allowedStatuses.length === 0}
              className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-xl text-white font-medium disabled:opacity-50"
            >
              {updating ? "Updating..." : "Update Status"}
            </button>
          </>
        )}

        {order.status === "Delivered" && (
          <button
            onClick={downloadInvoice}
            disabled={downloading}
            className="px-6 py-2 bg-gray-800 hover:bg-black text-white rounded-xl text-sm disabled:opacity-50"
          >
            {downloading ? "Downloading..." : "Download Invoice"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminOrderDetails;
