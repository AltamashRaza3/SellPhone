import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import riderApi from "../api/riderApi";
import { FiCamera, FiPhoneCall } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

/* ================= VERIFICATION CHECKLIST ================= */
const VERIFICATION_CHECKS = {
  screenCrack: "Screen intact",
  bodyDent: "No body dents",
  speakerFault: "Speaker working",
  micFault: "Mic working",
  batteryBelow80: "Battery health ≥ 80%",
  cameraFault: "Camera working",
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
    const res = await riderApi.get(`/pickups/${id}`);
    setPickup(res.data);
  };

  useEffect(() => {
    loadPickup().finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-zinc-400">Loading…</div>;
  }

  if (!pickup) {
    return (
      <div className="py-20 text-center text-zinc-400">Pickup not found</div>
    );
  }

  const { phone, pickup: p, pricing, verification, contact } = pickup;

  /* ================= STATE FLAGS ================= */
  const isScheduled = p?.status === "Scheduled";
  const isPicked = p?.status === "Picked";
  const isCompleted = p?.status === "Completed";
  const isRejected = p?.status === "Rejected";

  const hasUploadedImages =
    Array.isArray(verification?.images) && verification.images.length > 0;

  const isVerified =
    verification?.checks && Object.keys(verification.checks).length > 0;

  const canVerify =
    !isRejected &&
    (isScheduled || isPicked) &&
    !isVerified &&
    hasUploadedImages;

  const canComplete =
    !isRejected && isPicked && isVerified && hasUploadedImages;

  /* ================= IMAGE HANDLERS ================= */
  const handleFileSelect = (e) => {
    setImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) setImages((prev) => [...prev, file]);
  };

  /* ================= IMAGE UPLOAD ================= */
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

  /* ================= VERIFY DEVICE ================= */
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

  /* ================= COMPLETE PICKUP ================= */
  const completePickup = async () => {
    if (!canComplete) return;
    await riderApi.put(`/pickups/${id}/complete`);
    navigate("/pickups");
  };

  /* ================= 🚨 REJECT PICKUP ================= */
  const rejectPickup = async () => {
    if (!rejectReason.trim() || isRejected) return;

    if (!window.confirm("This will escalate the issue to admin. Are you sure?"))
      return;

    setRejecting(true);
    try {
      await riderApi.put(`/pickups/${id}/reject`, {
        reason: rejectReason,
      });
      await loadPickup();
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* BACK */}
      <button
        onClick={() => navigate("/pickups")}
        className="text-sm text-zinc-400"
      >
        ← Back to pickups
      </button>

      {/* DEVICE INFO */}
      <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 space-y-2">
        <h2 className="font-semibold text-lg text-white">
          {phone.brand} {phone.model}
        </h2>

        <p className="text-sm text-zinc-400">
          {phone.storage} • {phone.color} • {phone.declaredCondition}
        </p>

        <p className="text-emerald-400 font-semibold">
          Base Price: ₹{pricing?.basePrice?.toLocaleString("en-IN")}
        </p>

        {verification?.finalPrice && (
          <p className="text-red-400 font-semibold">
            Final Price: ₹{verification.finalPrice.toLocaleString("en-IN")}
          </p>
        )}
      </div>

      {/* 📞 CONTACT */}
      {contact?.phone && !isRejected && (
        <div className="flex gap-3">
          <a
            href={`tel:${contact.phone}`}
            className="flex-1 h-12 rounded-xl bg-emerald-600 text-black font-semibold flex items-center justify-center gap-2"
          >
            <FiPhoneCall /> Call
          </a>

          <a
            href={`https://wa.me/91${contact.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 rounded-xl bg-green-600 text-black font-semibold flex items-center justify-center gap-2"
          >
            <FaWhatsapp /> WhatsApp
          </a>
        </div>
      )}

      {/* 🚨 REJECTED STATE */}
      {isRejected && (
        <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-center font-semibold">
          Pickup rejected and escalated to admin
        </div>
      )}

      {/* VERIFICATION */}
      {!isVerified && !isRejected && (isScheduled || isPicked) && (
        <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 space-y-3">
          <p className="font-medium text-white">Device Verification</p>

          {Object.entries(VERIFICATION_CHECKS).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 text-sm">
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
            className="w-full h-11 rounded-xl bg-zinc-800 text-white disabled:opacity-50"
          >
            {verifying ? "Verifying…" : "Verify Device"}
          </button>
        </div>
      )}

      {/* IMAGE UPLOAD */}
      {!isCompleted && !isVerified && !isRejected && (
        <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 space-y-3">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
          />

          <button
            onClick={() => cameraInputRef.current.click()}
            className="w-full h-11 rounded-xl bg-zinc-800 text-white flex items-center justify-center gap-2"
          >
            <FiCamera /> Open Camera
          </button>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCameraCapture}
          />

          <button
            onClick={uploadImages}
            disabled={uploading || images.length === 0}
            className="w-full h-11 rounded-xl bg-purple-600 text-white font-semibold disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload Images"}
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

      {/* 🚨 REJECT PICKUP */}
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
            className="w-full h-11 rounded-xl bg-red-600 text-white disabled:opacity-50"
          >
            {rejecting ? "Escalating…" : "Reject & Escalate"}
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="p-4 rounded-xl bg-green-500/10 text-green-400 font-semibold text-center">
          Pickup Completed Successfully
        </div>
      )}
    </div>
  );
};

export default PickupDetails;
