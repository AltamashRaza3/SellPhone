import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import riderApi from "../api/riderApi";
import { FiCamera, FiPhoneCall, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import API_BASE_URL from "../config/api";

/* ================= VERIFICATION CHECKLIST ================= */
const VERIFICATION_CHECKS = {
  screenIntact: "Screen intact",
  noBodyDent: "No body dents",
  speakerWorking: "Speaker working",
  micWorking: "Mic working",
  batteryAbove80: "Battery health ≥ 80%",
  cameraWorking: "Camera working",
};

const PickupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);

  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const [checks, setChecks] = useState(
    Object.keys(VERIFICATION_CHECKS).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {},
    ),
  );

  const [rejectReason, setRejectReason] = useState("");

  /* ================= LOAD PICKUP ================= */
  const loadPickup = async () => {
    try {
      const res = await riderApi.get(`/pickups/${id}`);
      setPickup((prev) =>
        JSON.stringify(prev) === JSON.stringify(res.data) ? prev : res.data,
      );
    } catch {
      setPickup(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPickup();
  }, [id]);

  if (loading) {
    return <div className="py-24 text-center text-zinc-400">Loading…</div>;
  }

  if (!pickup) {
    return (
      <div className="py-24 text-center text-zinc-400">Pickup not found</div>
    );
  }

  const { phone, pickup: p, pricing, verification, contact } = pickup;

  /* ================= STATE ================= */
  const isScheduled = p.status === "Scheduled";
  const isPicked = p.status === "Picked";
  const isCompleted = p.status === "Completed";
  const isRejected = p.status === "Rejected";

  const isVerified = Boolean(verification?.finalPrice);
  const userAccepted = verification?.userAccepted === true;

  const hasVerificationImages =
    Array.isArray(verification?.images) && verification.images.length > 0;

  const hasChecksSelected = Object.values(checks).some(Boolean);

  const canVerify =
    !isRejected &&
    (isScheduled || isPicked) &&
    !isVerified &&
    hasVerificationImages &&
    hasChecksSelected;

  const canComplete = !isRejected && isPicked && isVerified && userAccepted;

  /* ================= IMAGE HELPERS ================= */
  const resolveImageUrl = (img) => {
    if (!img) return "";
    if (typeof img === "string") {
      return img.startsWith("http") ? img : `${API_BASE_URL}${img}`;
    }
    if (img?.url) {
      return img.url.startsWith("http") ? img.url : `${API_BASE_URL}${img.url}`;
    }
    return "";
  };

  /* ================= IMAGE HANDLERS ================= */
  const handleFileSelect = (e) => {
    setImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) setImages((prev) => [...prev, file]);
  };

  /* ================= ACTIONS ================= */
  const uploadImages = async () => {
    if (!images.length || isRejected) return;

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    setUploading(true);
    try {
      await riderApi.post(`/pickups/${id}/upload-images`, formData);
      setImages([]);
      await loadPickup();
    } finally {
      setUploading(false);
    }
  };

  const verifyDevice = async () => {
    if (!canVerify) return;

    setVerifying(true);
    try {
      await riderApi.put(`/pickups/${id}/verify`, {
        checks,
        riderNotes: "Verified by rider",
      });
      await loadPickup();
    } finally {
      setVerifying(false);
    }
  };

  const completePickup = async () => {
    if (!canComplete) return;
    await riderApi.put(`/pickups/${id}/complete`);
    navigate("/pickups");
  };

  const rejectPickup = async () => {
    if (!rejectReason.trim() || isRejected) return;
    if (!window.confirm("Escalate this issue to admin?")) return;

    setRejecting(true);
    try {
      await riderApi.put(`/pickups/${id}/reject`, { reason: rejectReason });
      await loadPickup();
    } finally {
      setRejecting(false);
    }
  };

  const mapQuery = encodeURIComponent(
    `${p.address?.line1 || ""} ${p.address?.city || ""} ${
      p.address?.pincode || ""
    }`,
  );

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/pickups")}
        className="text-sm text-zinc-400"
      >
        ← Back to pickups
      </button>

      {/* DEVICE INFO */}
      <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4">
        <h2 className="text-lg font-semibold text-white">
          {phone?.brand} {phone?.model}
        </h2>
        <p className="text-sm text-zinc-400">
          {phone?.storage} • {phone?.color} • {phone?.declaredCondition}
        </p>
        <p className="text-emerald-400 font-semibold mt-1">
          Base Price: ₹{pricing?.basePrice?.toLocaleString("en-IN")}
        </p>
        {verification?.finalPrice && (
          <p className="text-red-400 font-semibold">
            Final Price: ₹{verification.finalPrice.toLocaleString("en-IN")}
          </p>
        )}
      </div>

      {/* CONTACT */}
      {contact?.phone && (
        <div className="flex gap-4 text-indigo-400">
          <a href={`tel:${contact.phone}`} className="flex items-center gap-1">
            <FiPhoneCall /> Call
          </a>
          <a
            href={`https://wa.me/91${contact.phone}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1"
          >
            <FaWhatsapp /> WhatsApp
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1"
          >
            <FiMapPin /> Maps
          </a>
        </div>
      )}

      {/* VERIFICATION CHECKLIST */}
      {!isVerified && !isRejected && (isScheduled || isPicked) && (
        <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 space-y-3">
          <p className="font-medium text-white">Device Verification</p>

          {Object.entries(VERIFICATION_CHECKS).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checks[key]}
                onChange={(e) =>
                  setChecks({ ...checks, [key]: e.target.checked })
                }
              />
              {label}
            </label>
          ))}

          <button
            onClick={verifyDevice}
            disabled={!canVerify || verifying}
            className="w-full h-11 rounded-xl bg-zinc-800 text-white disabled:opacity-40"
          >
            {verifying ? "Verifying…" : "Verify Device"}
          </button>
        </div>
      )}

      {/* COMPLETE */}
      {canComplete && (
        <button
          onClick={completePickup}
          className="w-full h-12 rounded-xl bg-emerald-600 text-black font-semibold"
        >
          Complete Pickup
        </button>
      )}

      {/* REJECT */}
      {!isCompleted && !isRejected && (
        <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 space-y-3">
          <textarea
            placeholder="Reason for rejection / escalation"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full rounded-xl bg-zinc-800 p-3 text-sm text-white"
          />
          <button
            onClick={rejectPickup}
            disabled={!rejectReason.trim() || rejecting}
            className="w-full h-11 rounded-xl bg-red-600 text-white disabled:opacity-40"
          >
            {rejecting ? "Escalating…" : "Reject & Escalate"}
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="p-4 rounded-xl bg-green-500/10 text-green-400 text-center font-semibold">
          Pickup Completed Successfully
        </div>
      )}
    </div>
  );
};

export default PickupDetails;
