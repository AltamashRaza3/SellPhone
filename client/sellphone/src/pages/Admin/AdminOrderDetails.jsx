import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";

import AdminOrderTimeline from "../../components/AdminOrderTimeline";
import AdminOrderStatusHistory from "../../components/AdminOrderStatusHistory.jsx";


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

  /* ======================================================
     FETCH ORDER
     ====================================================== */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/admin/orders/${id}`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load order");
        }

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

  /* ======================================================
     ALLOWED STATUS OPTIONS
     ====================================================== */
  const allowedStatuses = useMemo(() => {
    if (!order) return [];
    return TRANSITIONS[order.status] || [];
  }, [order]);

  const statusLocked =
    order?.status === "Delivered" || order?.status === "Cancelled";

  /* ======================================================
     UPDATE STATUS
     ====================================================== */
  const updateStatus = async () => {
    if (!status || updating || status === order.status) return;

    try {
      setUpdating(true);

      const res = await fetch(`http://localhost:5000/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

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

  /* ======================================================
     DOWNLOAD INVOICE (MEMOIZED)
     ====================================================== */
  const downloadInvoice = useCallback(() => {
    if (!order?.items?.length || downloading) return;

    try {
      setDownloading(true);

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("SalePhone - Admin Invoice", 20, 20);

      doc.setFontSize(10);
      doc.text(`Order ID: ${order._id}`, 20, 32);
      doc.text(`User Email: ${order.user?.email || "Guest"}`, 20, 38);
      doc.text(`Order Status: ${order.status}`, 20, 44);
      doc.text(
        `Order Date: ${new Date(order.createdAt).toLocaleString()}`,
        20,
        50
      );

      let y = 65;

      doc.setFontSize(11);
      doc.text("Items:", 20, y);
      y += 8;

      order.items.forEach((item, index) => {
        const phone = item.phone || {};

        doc.text(
          `${index + 1}. ${phone.brand || "Unknown"} ${phone.model || ""} (${
            phone.color || "N/A"
          }, ${phone.storage || "N/A"}) × ${item.quantity} — ₹${
            (phone.price || 0) * item.quantity
          }`,
          20,
          y
        );
        y += 7;
      });

      y += 5;
      doc.setFontSize(12);
      doc.text(`Total Amount: ₹${order.totalAmount}`, 20, y);

      doc.save(`admin-invoice-${order._id}.pdf`);
    } finally {
      setDownloading(false);
    }
  }, [order, downloading]);

  /* ======================================================
     UI STATES
     ====================================================== */
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

  /* ======================================================
     RENDER
     ====================================================== */
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

      <AdminOrderTimeline order={order} />
      <AdminOrderStatusHistory history={order.statusHistory} />

      {/* ITEMS */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Ordered Items</h2>

        <div className="space-y-4">
          {order.items.map((item, index) => {
            const phone = item.phone || {};

            return (
              <div
                key={index}
                className="flex justify-between border-b border-white/10 pb-3"
              >
                <div>
                  <p className="font-medium text-white">
                    {phone.brand || "Unknown"} {phone.model || ""}
                  </p>
                  <p className="text-sm text-gray-400">
                    {phone.color && `Color: ${phone.color} · `}
                    {phone.storage && `Storage: ${phone.storage}`}
                  </p>
                  <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                </div>

                <div className="text-right">
                  <p className="text-gray-400">₹{phone.price || 0}</p>
                  <p className="font-semibold text-white">
                    ₹{(phone.price || 0) * item.quantity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIONS */}
      {!statusLocked && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 flex flex-col sm:flex-row sm:items-end gap-4">
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

          <button
            onClick={downloadInvoice}
            disabled={downloading}
            className="px-6 py-2 bg-gray-800 hover:bg-black text-white rounded-xl text-sm disabled:opacity-50"
          >
            {downloading ? "Preparing..." : "Download Invoice (PDF)"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetails;
