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

  /* ================= FETCH REQUEST ================= */
  const fetchRequest = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/sell-requests/my", {
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      const found = data.find((r) => r._id === id);

      if (!found) throw new Error("Not found");

      setRequest(found);
    } catch {
      toast.error("Sell request not found");
      navigate("/my-sell-requests", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) fetchRequest();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="py-12 text-center">Loading…</div>;
  }

  if (!request) return null;

  const { phone, pricing, verification, pickup, assignedRider, invoice } =
    request;

  /* ================= CANCEL RULE ================= */
  const canCancel =
    pickup?.status === "Pending" &&
    !assignedRider?.riderId &&
    !verification?.finalPrice;

  /* ================= CANCEL HANDLER ================= */
  const cancelRequest = async () => {
    if (!window.confirm("Do you want to cancel this sell request?")) return;

    try {
      setCancelling(true);

      const res = await fetch(
        `http://localhost:5000/api/sell-requests/${request._id}/cancel`,
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

  return (
    <div className="appContainer py-10 space-y-6">
      {/* BACK */}
      <button onClick={() => navigate(-1)} className="text-sm text-gray-400">
        ← Back
      </button>

      {/* PHONE INFO */}
      <div className="glass-card space-y-2">
        <h2 className="text-xl font-semibold">
          {phone?.brand} {phone?.model}
        </h2>

        <p className="text-gray-400">
          {phone?.storage} • {phone?.declaredCondition}
        </p>

        <p className="text-orange-400">
          Base Price: ₹{pricing?.basePrice?.toLocaleString("en-IN")}
        </p>

        {verification?.finalPrice && (
          <p className="text-green-400 font-semibold">
            Final Price: ₹{verification.finalPrice.toLocaleString("en-IN")}
          </p>
        )}
      </div>

      {/* RIDER IMAGES */}
      {verification?.images?.length > 0 && (
        <div className="glass-card">
          <p className="font-medium mb-3">Rider Verification Images</p>
          <div className="grid grid-cols-3 gap-2">
            {verification.images.map((img, i) => (
              <img
                key={i}
                src={`http://localhost:5000${img.url}`}
                className="h-24 w-full object-cover rounded-lg"
                alt="Verification"
              />
            ))}
          </div>
        </div>
      )}

      {/* SELLER DECISION */}
      {verification?.finalPrice && verification.userAccepted === null && (
        <SellerDecision request={request} onDecision={fetchRequest} />
      )}

      {/* FINAL STATES */}
      {verification?.userAccepted === true && (
        <div className="p-4 rounded-xl bg-green-500/10 text-green-400 text-center font-semibold">
          You accepted the final price. Pickup completed.
        </div>
      )}

      {verification?.userAccepted === false && (
        <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-center font-semibold">
          You rejected the final price.
        </div>
      )}

      {/* CANCEL */}
      {canCancel && (
        <button
          onClick={cancelRequest}
          disabled={cancelling}
          className="w-full h-11 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50"
        >
          {cancelling ? "Cancelling…" : "Cancel Sell Request"}
        </button>
      )}

      {/* INVOICE DOWNLOAD */}
      {pickup?.status === "Completed" && invoice?.url && (
        <a
          href={`http://localhost:5000${invoice.url}`}
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
