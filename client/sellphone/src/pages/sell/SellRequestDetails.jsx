import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SellerDecision from "../../components/SellerDecision";
import { toast } from "react-hot-toast";

const SellRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  /* ================= FETCH SINGLE REQUEST ================= */
  const fetchRequest = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/sell-requests/${id}`,
        { credentials: "include" },
      );

      if (!res.ok) throw new Error();

      setRequest(await res.json());
    } catch {
      toast.error("Sell request not found");
      navigate("/my-sell-requests", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  if (loading) {
    return <div className="py-12 text-center">Loading…</div>;
  }

  if (!request) return null;

  const { phone, pricing, verification, pickup, assignedRider, invoice } =
    request;

  const canCancel =
    pickup?.status === "Pending" &&
    !assignedRider?.riderId &&
    !verification?.finalPrice;

  const cancelRequest = async () => {
    if (!window.confirm("Do you want to cancel this sell request?")) return;

    try {
      setCancelling(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/sell-requests/${request._id}/cancel`,
        { method: "PUT", credentials: "include" },
      );

      if (!res.ok) throw new Error();

      toast.success("Sell request cancelled");
      navigate("/my-sell-requests");
    } catch {
      toast.error("Failed to cancel request");
    } finally {
      setCancelling(false);
    }
  };
console.log("SELLER DETAILS DEBUG:", {
  verification,
  finalPrice: verification?.finalPrice,
  userAccepted: verification?.userAccepted,
  pickupStatus: pickup?.status,
  fullRequest: request,
});

  return (
    <div className="appContainer py-10 space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-400">
        ← Back
      </button>

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

      {verification?.images?.length > 0 && (
        <div className="glass-card">
          <p className="font-medium mb-3">Rider Verification Images</p>
          <div className="grid grid-cols-3 gap-2">
            {verification.images.map((img, i) => (
              <img
                key={i}
                src={`${import.meta.env.VITE_API_BASE_URL}${img.url}`}
                className="h-24 w-full object-cover rounded-lg"
                alt="Verification"
              />
            ))}
          </div>
        </div>
      )}

      {/* ✅ ACCEPT / REJECT BUTTONS */}
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

      {canCancel && (
        <button
          onClick={cancelRequest}
          disabled={cancelling}
          className="w-full h-11 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50"
        >
          {cancelling ? "Cancelling…" : "Cancel Sell Request"}
        </button>
      )}

      {pickup?.status === "Completed" && invoice?.url && (
        <a
          href={`${import.meta.env.VITE_API_BASE_URL}${invoice.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center"
        >
          Download Invoice (PDF)
        </a>
      )}
    </div>
  );
};

export default SellRequestDetails;
