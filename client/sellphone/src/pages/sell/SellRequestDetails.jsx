import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../utils/axios";
import SellerDecision from "../../components/SellerDecision";

const SellRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  /* ================= FETCH REQUEST ================= */
  const fetchRequest = async () => {
    try {
      const { data } = await api.get(`/sell-requests/${id}`);
      setRequest(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Sell request not found");
      navigate("/my-sell-requests", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center text-gray-400">
        Loading request details…
      </div>
    );
  }

  if (!request) return null;

  const { phone, pricing, verification, pickup, assignedRider } = request;

  /* ================= CANCEL LOGIC ================= */
  const canCancel =
    pickup?.status === "Pending" &&
    !assignedRider?.riderId &&
    !verification?.finalPrice;

  const cancelRequest = async () => {
    if (!window.confirm("Do you want to cancel this sell request?")) return;

    try {
      setCancelling(true);
      await api.put(`/sell-requests/${request._id}/cancel`);
      toast.success("Sell request cancelled");
      navigate("/my-sell-requests");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel request");
    } finally {
      setCancelling(false);
    }
  };

  /* ================= DOWNLOAD INVOICE ================= */
  const downloadInvoice = async () => {
    try {
      const res = await api.get(`/invoices/sell/${request._id}`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `SELL-${request._id.slice(-6)}.pdf`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to download invoice");
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 space-y-10">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-black transition"
      >
        ← Back
      </button>

      {/* HEADER */}
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          {phone.brand} {phone.model}
        </h1>
        <p className="text-gray-500 text-sm">
          {phone.storage} • {phone.declaredCondition}
        </p>
      </div>

      {/* SUMMARY CARD */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-4">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Request ID</span>
          <span>#{request._id.slice(-6)}</span>
        </div>

        <div className="border-t pt-4 space-y-2">
          <p className="text-gray-500 text-sm">Estimated Price</p>
          <p className="text-lg font-medium text-gray-900">
            ₹{pricing.basePrice.toLocaleString("en-IN")}
          </p>
        </div>

        {verification?.finalPrice && (
          <div className="border-t pt-4 space-y-2">
            <p className="text-gray-500 text-sm">Final Price Offered</p>
            <p className="text-2xl font-semibold text-green-600">
              ₹{verification.finalPrice.toLocaleString("en-IN")}
            </p>
          </div>
        )}
      </div>

      {/* RIDER INFO */}
      {assignedRider && pickup?.status === "Scheduled" && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <p className="text-sm font-medium text-blue-700">Pickup Scheduled</p>
          <p className="text-gray-700 mt-2">Rider: {assignedRider.riderName}</p>
          {assignedRider.riderPhone && (
            <p className="text-gray-600 text-sm">
              Phone: {assignedRider.riderPhone}
            </p>
          )}
        </div>
      )}

      {/* VERIFICATION IMAGES */}
      {verification?.images?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Verification Images
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {verification.images.map((img, i) => (
              <img
                key={i}
                src={`${import.meta.env.VITE_API_BASE_URL}${img.url}`}
                alt="Verification"
                className="rounded-2xl object-cover w-full h-40 border border-gray-100"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}

      {/* SELLER DECISION */}
      {verification?.finalPrice && verification.userAccepted === null && (
        <SellerDecision
          requestId={request._id}
          finalPrice={verification.finalPrice}
          onDecision={fetchRequest}
        />
      )}

      {verification?.userAccepted === true && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-green-700 font-medium text-center">
          You accepted the final price. Pickup will be completed shortly.
        </div>
      )}

      {verification?.userAccepted === false && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-red-700 font-medium text-center">
          You rejected the final price. This request is closed.
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row gap-4">
        {canCancel && (
          <button
            onClick={cancelRequest}
            disabled={cancelling}
            className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 transition"
          >
            {cancelling ? "Cancelling…" : "Cancel Sell Request"}
          </button>
        )}

        {pickup?.status === "Completed" && (
          <button
            onClick={downloadInvoice}
            className="px-6 py-3 rounded-full bg-black text-white hover:opacity-90 font-medium transition"
          >
            Download Invoice (PDF)
          </button>
        )}
      </div>
    </div>
  );
};

export default SellRequestDetails;
