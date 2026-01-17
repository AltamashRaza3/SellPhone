import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../utils/axios";
import { jsPDF } from "jspdf";
import { toast } from "react-hot-toast";

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
      <div className="p-6 text-center text-gray-400">
        Loading order details…
      </div>
    );
  }

  /* ================= NOT FOUND ================= */
  if (!order) {
    return (
      <div className="p-6 text-center text-gray-400">
        Order not found or access denied.
      </div>
    );
  }

  /* ================= DOWNLOAD INVOICE ================= */
  const downloadInvoice = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Order Invoice", 20, 20);

    doc.setFontSize(10);
    doc.text(`Order ID: ${order._id}`, 20, 30);
    doc.text(`Status: ${order.status}`, 20, 36);
    doc.text(`Total Amount: ₹${order.totalAmount}`, 20, 42);

    let y = 55;
    order.items.forEach((item, idx) => {
      const phone = item.phone;
      doc.text(
        `${idx + 1}. ${phone.brand} ${phone.model} (${phone.color || "N/A"}, ${
          phone.storage || "N/A"
        }) x${item.quantity}`,
        20,
        y
      );
      y += 7;
    });

    doc.save(`invoice-${order._id}.pdf`);
  };

  /* ================= CANCEL ORDER ================= */
  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const { data } = await axios.put(`/orders/${order._id}/cancel`);
      setOrder(data.order);
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Cancel order error:", error);
      toast.error(error?.response?.data?.message || "Failed to cancel order");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/orders" className="text-sm text-orange-400 hover:underline">
        ← Back to My Orders
      </Link>

      <h1 className="text-2xl font-semibold mt-4 mb-6">Order Details</h1>

      {/* ================= ORDER INFO ================= */}
      <div className="border border-gray-700 rounded-xl p-4 mb-6">
        <p className="text-sm">
          <span className="text-gray-400">Order ID:</span> {order._id}
        </p>
        <p className="text-sm">
          <span className="text-gray-400">Status:</span> {order.status}
        </p>
        <p className="text-sm">
          <span className="text-gray-400">Placed on:</span>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>

        {order.status === "Pending" && (
          <button
            onClick={handleCancelOrder}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* ================= ITEMS ================= */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">Ordered Items</h2>

        <div className="space-y-4">
          {order.items.map((item, idx) => {
            const phone = item.phone;

            return (
              <div
                key={idx}
                className="border border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row gap-4"
              >
                {/* IMAGE */}
                <img
                  src={phone.image}
                  alt={phone.model}
                  className="w-20 h-20 object-contain border rounded-md"
                />

                {/* DETAILS */}
                <div className="flex-1">
                  <p className="font-semibold text-base">
                    {phone.brand} {phone.model}
                  </p>

                  <div className="mt-2 space-y-1 text-sm text-gray-400">
                    {phone.color && (
                      <p>
                        <span className="text-gray-500">Color:</span>{" "}
                        {phone.color}
                      </p>
                    )}
                    {phone.storage && (
                      <p>
                        <span className="text-gray-500">Storage:</span>{" "}
                        {phone.storage}
                      </p>
                    )}
                    {phone.ram && (
                      <p>
                        <span className="text-gray-500">RAM:</span> {phone.ram}
                      </p>
                    )}
                  </div>
                </div>

                {/* PRICE */}
                <div className="text-sm text-right space-y-1">
                  <p>
                    <span className="text-gray-500">Qty:</span> {item.quantity}
                  </p>
                  <p>
                    <span className="text-gray-500">Price:</span> ₹{phone.price}
                  </p>
                  <p className="font-semibold text-base">
                    ₹{phone.price * item.quantity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="border border-gray-700 rounded-xl p-4">
        <h2 className="text-lg font-medium mb-2">Price Summary</h2>
        <p className="text-sm">
          <span className="text-gray-400">Total Amount:</span> ₹
          {order.totalAmount}
        </p>
      </div>

      {/* ================= INVOICE ================= */}
      <button
        onClick={downloadInvoice}
        className="mt-4 px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-lg text-sm"
      >
        Download Invoice (PDF)
      </button>
    </div>
  );
};

export default OrderDetails;
