import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import riderApi from "../api/riderApi";
import { FiCamera, FiPhoneCall, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
const API_BASE_URL = "http://localhost:5000";

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
    } catch (err) {
      console.error("LOAD PICKUP ERROR:", err);
      setPickup(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPickup();
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

  /* ================= PERMISSIONS ================= */
  const canVerify =
    !isRejected &&
    (isScheduled || isPicked) &&
    !isVerified &&
    hasVerificationImages &&
    hasChecksSelected;

  const canComplete = !isRejected && isPicked && isVerified && userAccepted;

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

  /* ================= REJECT PICKUP ================= */
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
const resolveImageUrl = (img) => {
  if (!img) return "";

  // string path from DB
  if (typeof img === "string") {
    return img.startsWith("http") ? img : `${API_BASE_URL}${img}`;
  }

  // object { url }
  if (img?.url) {
    return img.url.startsWith("http") ? img.url : `${API_BASE_URL}${img.url}`;
  }

  return "";
};

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/pickups")}
        className="text-sm text-zinc-400"
      >
        ← Back to pickups
      </button>

      {/* DEVICE INFO */}
      <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 space-y-2">
        <h2 className="text-lg font-semibold text-white">
          {phone.brand} {phone.model}
        </h2>
        <p className="text-sm text-zinc-400">
          {phone.storage} • {phone.color} • {phone.declaredCondition}
        </p>
        <p className="text-emerald-400 font-semibold">
          Base Price: ₹{pricing.basePrice.toLocaleString("en-IN")}
        </p>
        {verification?.finalPrice && (
          <p className="text-red-400 font-semibold">
            Final Price: ₹{verification.finalPrice.toLocaleString("en-IN")}
          </p>
        )}
      </div>

      {/* SELLER CONTACT */}
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
          {p.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1"
            >
              <FiMapPin /> Maps
            </a>
          )}
        </div>
      )}

      {/* USER UPLOADED IMAGES */}
      <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4">
        <p className="font-medium text-white mb-2">User Uploaded Images</p>

        {Array.isArray(phone.images) && phone.images.length ? (
          <div className="grid grid-cols-3 gap-2">
            {phone.images.map((img, i) => (
              <img
                key={i}
                src={resolveImageUrl(img)}
                alt="User uploaded phone"
                className="h-28 object-cover rounded-lg border border-white/10"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No images from user</p>
        )}
      </div>

      {/* RIDER VERIFICATION IMAGES */}
      <div className="rounded-2xl bg-zinc-900 border border-emerald-500/20 p-4">
        <p className="font-medium text-emerald-400 mb-2">
          Rider Verification Images
        </p>

        {Array.isArray(verification?.images) && verification.images.length ? (
          <div className="grid grid-cols-3 gap-2">
            {verification.images.map((img, i) => (
              <div key={i} className="space-y-1">
                <img
                  src={resolveImageUrl(img)}
                  alt="Rider verification"
                  className="h-28 object-cover rounded-lg border border-emerald-500/40"
                />
                <p className="text-[11px] text-zinc-500">
                  {new Date(img.uploadedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Rider has not uploaded verification images yet
          </p>
        )}
      </div>

      {/* WAITING */}
      {isPicked && !userAccepted && (
        <div className="bg-yellow-500/10 text-yellow-400 p-3 rounded-xl text-center">
          Waiting for seller to accept final price
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
            className="w-full h-11 rounded-xl bg-zinc-800 text-white disabled:opacity-40"
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
            className="w-full h-11 rounded-xl bg-zinc-800 text-white flex justify-center gap-2"
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
            className="w-full h-11 rounded-xl bg-purple-600 text-white font-semibold disabled:opacity-40"
          >
            {uploading ? "Uploading…" : "Upload Images"}
          </button>
        </div>
      )}

      {canComplete && (
        <button
          onClick={completePickup}
          className="w-full h-12 rounded-xl bg-emerald-600 text-black font-semibold"
        >
          Complete Pickup
        </button>
      )}

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
};;

export default PickupDetails;
