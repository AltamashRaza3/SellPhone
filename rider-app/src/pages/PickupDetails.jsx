import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import riderApi from "../api/riderApi";
import { FiPhoneCall, FiMapPin } from "react-icons/fi";
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
  const fileInputRef = useRef(null);

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
      setPickup(res.data);
    } catch {
      setPickup(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPickup();

    const interval = setInterval(() => {
      loadPickup();
    }, 5000); // refresh every 5 seconds

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500 text-sm">
        Loading pickup…
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="py-24 text-center text-gray-500">Pickup not found</div>
    );
  }

  const { phone, pickup: p, pricing, verification, contact } = pickup;

  /* ================= STATUS NORMALIZATION ================= */
  const status = p.status?.toLowerCase();

  const isScheduled = status === "scheduled";
  const isPicked = status === "picked";
  const isCompleted = status === "completed";
  const isRejected = status === "rejected";

  const isVerified = Boolean(verification?.finalPrice);
  const userAccepted = verification?.userAccepted === true;

  const hasVerificationImages =
    Array.isArray(verification?.images) && verification.images.length > 0;

  const hasChecksSelected = Object.values(checks).some(Boolean);

  const canUpload = !isRejected && (isScheduled || isPicked);
  const canVerify =
    canUpload && !isVerified && hasVerificationImages && hasChecksSelected;
  const canComplete = !isRejected && isPicked && isVerified && userAccepted;

  /* ================= IMAGE HANDLERS ================= */
  const handleFileSelect = (e) => {
    setImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

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

  /* ================= ACTIONS ================= */
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
    if (!rejectReason.trim()) return;
    if (!window.confirm("Escalate this issue to admin?")) return;

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

  const mapQuery = encodeURIComponent(
    `${p.address?.line1 || ""} ${p.address?.city || ""} ${p.address?.pincode || ""}`,
  );

  const resolveImageUrl = (img) => {
    if (!img) return "";

    // If backend sends string
    if (typeof img === "string") {
      return img.startsWith("http") ? img : `${API_BASE_URL}${img}`;
    }

    // If backend sends object { url: "..."}
    if (typeof img === "object" && img.url) {
      return img.url.startsWith("http") ? img.url : `${API_BASE_URL}${img.url}`;
    }

    return "";
  };


  /* ================= UI ================= */
  return (
    <div className="space-y-10">
      {/* BACK */}
      <button
        onClick={() => navigate("/pickups")}
        className="text-sm text-gray-500 hover:text-gray-900 transition"
      >
        ← Back to pickups
      </button>

      {/* DEVICE INFO */}
      <div className="bg-white rounded-[28px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {phone?.brand} {phone?.model}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {phone?.storage} • {phone?.color} • {phone?.declaredCondition}
          </p>
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">
              Base Price
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              ₹{pricing?.basePrice?.toLocaleString("en-IN")}
            </p>
          </div>

          {verification?.finalPrice && (
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Final Price
              </p>
              <p className="text-2xl font-semibold text-green-600 mt-1">
                ₹{verification.finalPrice.toLocaleString("en-IN")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CONTACT */}
      {contact?.phone && (
        <div className="bg-white rounded-[28px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] flex justify-around text-sm text-gray-600">
          <a
            href={`tel:${contact.phone}`}
            className="flex flex-col items-center gap-1 hover:text-blue-600 transition"
          >
            <FiPhoneCall size={18} />
            Call
          </a>

          <a
            href={`https://wa.me/91${contact.phone}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 hover:text-green-600 transition"
          >
            <FaWhatsapp size={18} />
            WhatsApp
          </a>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 hover:text-indigo-600 transition"
          >
            <FiMapPin size={18} />
            Maps
          </a>
        </div>
      )}

      {/* IMAGE UPLOAD */}
      {canUpload && (
        <div className="bg-white rounded-[28px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Device Photos
          </h3>

          {/* Existing Images */}
          {verification?.images?.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {verification.images.map((img, i) => (
                <img
                  key={i}
                  src={resolveImageUrl(img)}
                  alt="device"
                  className="rounded-xl object-cover aspect-square"
                />
              ))}
            </div>
          )}

          {/* Selected Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((file, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="rounded-xl object-cover aspect-square"
                />
              ))}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition"
            >
              Select Photos
            </button>

            <button
              onClick={uploadImages}
              disabled={!images.length || uploading}
              className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* VERIFICATION */}
      {canUpload && !isVerified && (
        <div className="bg-white rounded-[28px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Device Verification
          </h3>

          <div className="space-y-4">
            {Object.entries(VERIFICATION_CHECKS).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checks[key]}
                  onChange={(e) =>
                    setChecks({ ...checks, [key]: e.target.checked })
                  }
                  className="w-4 h-4 accent-blue-600"
                />
                {label}
              </label>
            ))}
          </div>

          <button
            onClick={verifyDevice}
            disabled={!canVerify || verifying}
            className="w-full h-14 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {verifying ? "Verifying…" : "Verify Device"}
          </button>
        </div>
      )}

      {isVerified && verification?.userAccepted === null && (
        <div className="bg-blue-50 border border-blue-200 rounded-[28px] p-6 text-center text-blue-600 font-medium">
          Waiting for user to accept the final price...
        </div>
      )}

      {/* COMPLETE */}
      {canComplete && (
        <button
          onClick={completePickup}
          className="w-full h-14 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        >
          Complete Pickup
        </button>
      )}

      {/* REJECT */}
      {!isCompleted && !isRejected && (
        <div className="bg-white rounded-[28px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] space-y-5">
          <textarea
            placeholder="Reason for rejection / escalation"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 p-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <button
            onClick={rejectPickup}
            disabled={!rejectReason.trim() || rejecting}
            className="w-full h-14 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {rejecting ? "Escalating…" : "Reject & Escalate"}
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-[28px] p-6 text-center text-green-600 font-medium">
          Pickup Completed Successfully
        </div>
      )}
    </div>
  );
};

export default PickupDetails;
