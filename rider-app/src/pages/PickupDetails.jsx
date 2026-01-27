import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import riderApi from "../api/riderApi";
import { FiCamera } from "react-icons/fi";

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

  const [checks, setChecks] = useState(
    Object.keys(VERIFICATION_CHECKS).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {}
    )
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

  const { phone, pickup: p, pricing, verification } = pickup;

  /* ================= STATE FLAGS ================= */
  const isScheduled = p?.status === "Scheduled";
  const isPicked = p?.status === "Picked";
  const isCompleted = p?.status === "Completed";

  const hasUploadedImages =
    Array.isArray(verification?.images) && verification.images.length > 0;

  const isVerified =
    verification?.checks && Object.keys(verification.checks).length > 0;

  const canVerify =
    (isScheduled || isPicked) && !isVerified && hasUploadedImages;

  const canComplete = isPicked && isVerified && hasUploadedImages;

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
    if (!images.length) return;

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

  /* ================= REJECT PICKUP ================= */
  const rejectPickup = async () => {
    if (!rejectReason.trim()) return;
    await riderApi.put(`/pickups/${id}/reject`, { reason: rejectReason });
    navigate("/pickups");
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
      <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4">
        <h2 className="font-semibold text-lg text-white">
          {phone.brand} {phone.model}
        </h2>
        <p className="text-sm text-zinc-400">
          {phone.storage} • {phone.color} • {phone.declaredCondition}
        </p>

        <p className="mt-2 text-emerald-400 font-semibold">
          Base Price: ₹{pricing?.basePrice?.toLocaleString("en-IN")}
        </p>

        {pricing?.finalPrice && (
          <p className="text-red-400 font-semibold">
            Final Price: ₹{pricing.finalPrice.toLocaleString("en-IN")}
          </p>
        )}
      </div>

      {/* USER UPLOADED IMAGES (FIXED) */}
      {Array.isArray(phone.images) && phone.images.length > 0 && (
        <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4">
          <p className="text-sm font-medium mb-3 text-white">
            User Uploaded Images
          </p>
          <div className="grid grid-cols-3 gap-2">
            {phone.images.map((img, idx) => (
              <img
                key={idx}
                src={`http://localhost:5000${img}`}
                className="h-24 w-full object-cover rounded-xl"
                alt="User Device"
              />
            ))}
          </div>
        </div>
      )}

      {/* VERIFICATION */}
      {!isVerified && (isScheduled || isPicked) && (
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
      {!isCompleted && (
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

      {/* COMPLETE PICKUP */}
      {canComplete && (
        <button
          onClick={completePickup}
          className="w-full h-12 rounded-xl bg-emerald-600 text-black font-semibold"
        >
          Complete Pickup
        </button>
      )}

      {/* COMPLETED */}
      {isCompleted && (
        <div className="p-4 rounded-xl bg-green-500/10 text-green-400 font-semibold text-center">
          Pickup Completed Successfully
        </div>
      )}

      {/* REJECT */}
      {!isCompleted && (
        <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 space-y-3">
          <textarea
            placeholder="Reason for rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full rounded-xl bg-zinc-800 p-3 text-sm text-white"
          />
          <button
            onClick={rejectPickup}
            disabled={!rejectReason.trim()}
            className="w-full h-11 rounded-xl bg-red-600 text-white disabled:opacity-50"
          >
            Reject Pickup
          </button>
        </div>
      )}
    </div>
  );
};

export default PickupDetails;
