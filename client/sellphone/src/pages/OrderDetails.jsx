import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../utils/axios";
import { toast } from "react-hot-toast";
import OrderTimeline from "../components/OrderTimeline";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { resolveImageUrl } from "../utils/resolveImageUrl";
import noImage from "../assets/no-image.png";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Loading order details…
      </div>
    );
  }

  /* ================= NOT FOUND ================= */
  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Order not found or access denied.
      </div>
    );
  }

  /* ================= CANCEL ORDER ================= */
  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const { data } = await axios.put(`/orders/${order._id}/cancel`);
      setOrder(data.order);
      toast.success("Order cancelled successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to cancel order");
    }
  };
const downloadInvoice = async () => {
  try {
    const res = await axios.get(`/invoices/order/${order._id}`, {
      responseType: "blob", // 🔥 REQUIRED FOR PDF
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${order._id.slice(-6)}.pdf`;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    toast.error("Unauthorized or invoice not available");
  }
};


  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      {/* BACK */}
      <Link
        to="/orders"
        className="text-sm text-gray-500 hover:text-gray-900 transition"
      >
        ← Back to My Orders
      </Link>

      <div className="mt-6 mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          Order Details
        </h1>
      </div>

      {/* ================= ORDER META ================= */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 mb-10 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-1 text-sm text-gray-500">
            <p>
              <span className="text-gray-400">Order ID:</span> {order._id}
            </p>
            <p>
              <span className="text-gray-400">Placed on:</span>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        <OrderTimeline status={order.status} />

        {order.status === "Pending" && (
          <button
            onClick={handleCancelOrder}
            className="mt-4 px-6 py-3 rounded-full text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* ================= ITEMS ================= */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Ordered Items
        </h2>

        <div className="space-y-6">
          {order.items.map((item, idx) => {
            const product = item.productId || {};

            return (
              <div
                key={idx}
                className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row gap-8"
              >
                <img
                  src={resolveImageUrl(product.images?.[0])}
                  alt={product.model || "Product"}
                  className="w-28 h-28 object-contain rounded-2xl bg-gray-50 border border-gray-100"
                  onError={(e) => (e.currentTarget.src = noImage)}
                />

                <div className="flex-1 space-y-2">
                  <p className="text-lg font-semibold text-gray-900">
                    {product.brand} {product.model}
                  </p>

                  <div className="text-sm text-gray-500 space-y-1">
                    {product.color && <p>Color: {product.color}</p>}
                    {product.storage && <p>Storage: {product.storage}</p>}
                    {product.ram && <p>RAM: {product.ram}</p>}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  <p className="text-sm text-gray-500">
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= TOTAL ================= */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 flex justify-between items-center mb-10">
        <span className="text-lg text-gray-600">Total Amount</span>
        <span className="text-2xl font-semibold text-gray-900">
          ₹{Number(order.totalAmount).toLocaleString("en-IN")}
        </span>
      </div>

      {/* ================= INVOICE ================= */}
      <div className="flex justify-end">
        {order.status === "Delivered" ? (
          <button
            onClick={downloadInvoice}
            className="px-8 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-90 transition"
          >
            Download Invoice
          </button>
        ) : (
          <p className="text-sm text-gray-400">
            Invoice will be available after delivery
          </p>
        )}
      </div>
    </div>
  );

};

export default OrderDetails;
