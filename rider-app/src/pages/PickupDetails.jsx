import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import riderApi from "../api/riderApi";
import API_BASE_URL from "../config/api";
import { FiPhoneCall, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

/* ================= CHECKLIST ================= */
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

  /* ================= LOAD ================= */
  const loadPickup = async (silent = false) => {
    try {
      const res = await riderApi.get(`/pickups/${id}`);
      setPickup(res.data);
    } catch {
      if (!silent) setPickup(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadPickup();
    const interval = setInterval(() => loadPickup(true), 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading)
    return (
      <div className="py-24 text-center text-gray-500 text-sm">
        Loading pickup…
      </div>
    );

  if (!pickup)
    return (
      <div className="py-24 text-center text-gray-500">Pickup not found</div>
    );

  const {
    phone = {},
    pickup: p = {},
    pricing = {},
    verification = {},
    contact = {},
  } = pickup;

  const status = (p.status || "").toLowerCase();

  const isScheduled = status === "scheduled";
  const isPicked = status === "picked";
  const isCompleted = status === "completed";
  const isRejected = status === "rejected";

  const isVerified = Boolean(verification?.finalPrice);
  const userAccepted = verification?.userAccepted === true;

  const canWork = !isRejected && !isCompleted && !isVerified;

  const hasImages =
    Array.isArray(verification?.images) && verification.images.length > 0;

  const canVerify = canWork && hasImages && Object.values(checks).some(Boolean);

  const canComplete = isPicked && isVerified && userAccepted;

  /* ================= FILE UPLOAD ================= */
  const handleFileSelect = (e) => {
    setImages(Array.from(e.target.files || []));
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

  const resolveImageUrl = (img) => {
    if (!img) return "";

    // If string path
    if (typeof img === "string") {
      return img.startsWith("http") ? img : `${API_BASE_URL}${img}`;
    }

    // If object with url
    if (typeof img === "object" && img.url) {
      return img.url.startsWith("http") ? img.url : `${API_BASE_URL}${img.url}`;
    }

    // If object with filename
    if (typeof img === "object" && img.filename) {
      return `${API_BASE_URL}/uploads/${img.filename}`;
    }

    return "";
  };

  /* ================= ACTIONS ================= */
  const verifyDevice = async () => {
    if (!canVerify) return;

    setVerifying(true);
    try {
      await riderApi.put(`/pickups/${id}/verify`, {
        checks,
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
    if (!window.confirm("Escalate to admin?")) return;

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
    `${p.address?.line1 || ""} ${p.address?.city || ""}`,
  );

  /* ================= UI ================= */
  return (
    <div className="space-y-8">
      {/* BACK */}
      <button
        onClick={() => navigate("/pickups")}
        className="text-sm text-gray-500"
      >
        ← Back to pickups
      </button>

      {/* DEVICE CARD */}
      <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">
          {phone.brand} {phone.model}
        </h2>
        <p className="text-sm text-gray-500">
          {phone.storage} • {phone.color} • {phone.declaredCondition}
        </p>

        <p className="text-sm text-gray-400 uppercase">Base Price</p>
        <p className="text-2xl font-semibold">
          ₹{pricing.basePrice?.toLocaleString("en-IN")}
        </p>
      </div>

      {/* CONTACT ACTIONS */}
      <div className="grid grid-cols-3 gap-4">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
          target="_blank"
          className="flex items-center justify-center gap-2 bg-gray-100 rounded-xl py-3"
        >
          <FiMapPin /> Map
        </a>

        <a
          href={`tel:${contact?.phone}`}
          className="flex items-center justify-center gap-2 bg-gray-100 rounded-xl py-3"
        >
          <FiPhoneCall /> Call
        </a>

        <a
          href={`https://wa.me/${contact?.phone}`}
          target="_blank"
          className="flex items-center justify-center gap-2 bg-green-100 rounded-xl py-3 text-green-700"
        >
          <FaWhatsapp /> WhatsApp
        </a>
      </div>

      {/* REJECTED */}
      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-red-600">
          Rejected: {p.rejectReason}
        </div>
      )}

      {/* VERIFICATION */}
      {canWork && (
        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold">Verification</h3>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-12 border rounded-xl"
          >
            Select Images
          </button>

          {images.length > 0 && (
            <button
              onClick={uploadImages}
              disabled={uploading}
              className="w-full h-12 bg-blue-600 text-white rounded-xl"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          )}

          {hasImages && (
            <div className="grid grid-cols-3 gap-3">
              {verification.images.map((img, i) => (
                <img
                  key={i}
                  src={resolveImageUrl(img)}
                  className="h-24 w-full object-cover rounded-xl"
                />
              ))}
            </div>
          )}

          {Object.entries(VERIFICATION_CHECKS).map(([key, label]) => (
            <label key={key} className="flex gap-3">
              <input
                type="checkbox"
                checked={checks[key]}
                onChange={() =>
                  setChecks((prev) => ({
                    ...prev,
                    [key]: !prev[key],
                  }))
                }
              />
              {label}
            </label>
          ))}

          <button
            onClick={verifyDevice}
            disabled={!canVerify || verifying}
            className="w-full h-14 bg-black text-white rounded-2xl"
          >
            {verifying ? "Verifying..." : "Verify Device"}
          </button>

          <textarea
            placeholder="Reject reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full border rounded-xl p-3"
          />

          <button
            onClick={rejectPickup}
            disabled={rejecting}
            className="w-full h-12 bg-red-600 text-white rounded-xl"
          >
            Reject
          </button>
        </div>
      )}

      {/* WAITING */}
      {isVerified && !userAccepted && (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 text-blue-600 text-center">
          Waiting for user acceptance...
        </div>
      )}

      {/* COMPLETE */}
      {canComplete && (
        <button
          onClick={completePickup}
          className="w-full h-14 bg-green-600 text-white rounded-2xl"
        >
          Complete Pickup
        </button>
      )}

      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-3xl p-6 text-green-600 text-center">
          Pickup Completed Successfully
        </div>
      )}
    </div>
  );
};

export default PickupDetails;
