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

  /* ================= LOADING ================= */
  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading…</div>;
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
    <div className="appContainer py-10 space-y-6">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 hover:underline"
      >
        ← Back
      </button>

      {/* SUMMARY */}
      <div className="glass-card space-y-2">
        <h2 className="text-xl font-semibold">
          {phone.brand} {phone.model}
        </h2>

        <p className="text-gray-400">
          {phone.storage} • {phone.declaredCondition}
        </p>

        <p className="text-orange-400">
          Base Price: ₹{pricing.basePrice.toLocaleString("en-IN")}
        </p>

        {verification?.finalPrice && (
          <p className="text-green-400 font-semibold">
            Final Price: ₹{verification.finalPrice.toLocaleString("en-IN")}
          </p>
        )}
      </div>

      {/* VERIFICATION IMAGES */}
      {verification?.images?.length > 0 && (
        <div className="glass-card">
          <p className="font-medium mb-3">Rider Verification Images</p>
          <div className="grid grid-cols-3 gap-2">
            {verification.images.map((img, i) => (
              <img
                key={i}
                src={`${import.meta.env.VITE_API_BASE_URL}${img.url}`}
                alt="Verification"
                className="h-24 w-full object-cover rounded-lg"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}

      {/* USER DECISION */}
      {verification?.finalPrice && verification.userAccepted === null && (
        <SellerDecision
          requestId={request._id}
          finalPrice={verification.finalPrice}
          onDecision={fetchRequest}
        />
      )}

      {verification?.userAccepted === true && (
        <div className="p-4 rounded-xl bg-green-500/10 text-green-400 text-center font-semibold">
          You accepted the final price. The rider will complete the pickup.
        </div>
      )}

      {verification?.userAccepted === false && (
        <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-center font-semibold">
          You rejected the final price. The request is closed.
        </div>
      )}

      {/* CANCEL */}
      {canCancel && (
        <button
          onClick={cancelRequest}
          disabled={cancelling}
          className="w-full max-w-md h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50"
        >
          {cancelling ? "Cancelling…" : "Cancel Sell Request"}
        </button>
      )}

      {/* INVOICE */}
      {pickup?.status === "Completed" && (
        <button
          onClick={downloadInvoice}
          className="w-full max-w-md h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
        >
          Download Invoice (PDF)
        </button>
      )}
    </div>
  );
};

export default SellRequestDetails;
