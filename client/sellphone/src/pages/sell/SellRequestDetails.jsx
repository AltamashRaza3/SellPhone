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
    <div className="bg-[#f2f2f7] min-h-screen py-28">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl px-6 space-y-16">
          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-black transition"
          >
            ← Back
          </button>

          {/* HEADER */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
              {phone.brand} {phone.model}
            </h1>

            <p className="text-lg text-gray-500">
              {phone.storage} • {phone.declaredCondition}
            </p>
          </div>

          {/* SUMMARY PANEL */}
          <div
            className="
          bg-white
          rounded-3xl
          px-14
          py-12
          shadow-[0_15px_50px_rgba(0,0,0,0.05)]
          space-y-8
        "
          >
            <div className="flex justify-between text-sm text-gray-400 uppercase tracking-widest">
              <span>Request</span>
              <span>#{request._id.slice(-6)}</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">Estimated Price</p>
              <p className="text-2xl font-medium text-gray-900">
                ₹{pricing.basePrice.toLocaleString("en-IN")}
              </p>
            </div>

            {verification?.finalPrice && (
              <div className="pt-6 border-t border-gray-100 space-y-2">
                <p className="text-sm text-gray-500">Final Price Offered</p>
                <p className="text-3xl font-semibold text-green-600">
                  ₹{verification.finalPrice.toLocaleString("en-IN")}
                </p>
              </div>
            )}
          </div>

          {/* RIDER INFO */}
          {assignedRider && pickup?.status === "Scheduled" && (
            <div
              className="
            bg-white
            rounded-3xl
            px-14
            py-10
            shadow-[0_10px_40px_rgba(0,0,0,0.04)]
            space-y-3
          "
            >
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                Pickup Scheduled
              </p>
              <p className="text-lg text-gray-900">
                Rider: {assignedRider.riderName}
              </p>
              {assignedRider.riderPhone && (
                <p className="text-gray-500">{assignedRider.riderPhone}</p>
              )}
            </div>
          )}

          {/* VERIFICATION IMAGES */}
          {verification?.images?.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 text-center">
                Verification Images
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {verification.images.map((img, i) => (
                  <img
                    key={i}
                    src={`${import.meta.env.VITE_API_BASE_URL}${img.url}`}
                    alt="Verification"
                    className="rounded-3xl object-cover w-full h-48 shadow-sm"
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
            <div
              className="
            bg-white
            rounded-3xl
            py-10
            text-center
            shadow-[0_10px_40px_rgba(0,0,0,0.04)]
          "
            >
              <p className="text-green-600 text-lg font-medium">
                You accepted the final price.
              </p>
              <p className="text-gray-500 mt-2">
                Pickup will be completed shortly.
              </p>
            </div>
          )}

          {verification?.userAccepted === false && (
            <div
              className="
            bg-white
            rounded-3xl
            py-10
            text-center
            shadow-[0_10px_40px_rgba(0,0,0,0.04)]
          "
            >
              <p className="text-red-600 text-lg font-medium">
                You rejected the final price.
              </p>
              <p className="text-gray-500 mt-2">This request is now closed.</p>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-col md:flex-row justify-center gap-6 pt-8">
            {canCancel && (
              <button
                onClick={cancelRequest}
                disabled={cancelling}
                className="
                px-10 py-4
                rounded-full
                text-base
                font-medium
                bg-red-600
                hover:bg-red-700
                text-white
                transition
                disabled:opacity-50
              "
              >
                {cancelling ? "Cancelling…" : "Cancel Sell Request"}
              </button>
            )}

            {pickup?.status === "Completed" && (
              <button
                onClick={downloadInvoice}
                className="
                px-10 py-4
                rounded-full
                text-base
                font-medium
                bg-black
                text-white
                hover:opacity-90
                transition
              "
              >
                Download Invoice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

};

export default SellRequestDetails;
