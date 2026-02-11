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

  /* ================= POLLING ================= */
  useEffect(() => {
    loadPickup();

    const interval = setInterval(() => {
      loadPickup(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  /* ================= LOADING STATES ================= */
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

  /* ================= SAFE DATA ================= */
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

  const hasVerificationImages =
    Array.isArray(verification?.images) && verification.images.length > 0;

  const hasChecksSelected = Object.values(checks).some(Boolean);

  const canUpload = !isRejected && (isScheduled || isPicked) && !isVerified;
  const canVerify = canUpload && hasVerificationImages && hasChecksSelected;

  const canComplete = !isRejected && isPicked && isVerified && userAccepted;

  /* ================= IMAGE HANDLING ================= */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
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

    if (typeof img === "string") {
      return img.startsWith("http") ? img : `${API_BASE_URL}${img}`;
    }

    if (typeof img === "object" && img.url) {
      return img.url.startsWith("http") ? img.url : `${API_BASE_URL}${img.url}`;
    }

    return "";
  };

  /* ================= ACTIONS ================= */
  const verifyDevice = async () => {
    if (!canVerify) return;

    setVerifying(true);
    try {
      await riderApi.put(`/pickups/${id}/verify`, { checks });
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

  /* ================= UI ================= */
  return (
    <div className="space-y-8">
      {/* BACK */}
      <button
        onClick={() => navigate("/pickups")}
        className="text-sm text-gray-500 hover:text-gray-900 transition"
      >
        ← Back to pickups
      </button>

      {/* DEVICE CARD */}
      <div className="bg-white rounded-3xl p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {phone.brand} {phone.model}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {phone.storage} • {phone.color} • {phone.declaredCondition}
          </p>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Base Price
          </p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            ₹{pricing.basePrice?.toLocaleString("en-IN")}
          </p>

          {verification?.finalPrice && (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-4">
                Final Price
              </p>
              <p className="text-2xl font-semibold text-green-600 mt-1">
                ₹{verification.finalPrice.toLocaleString("en-IN")}
              </p>
            </>
          )}
        </div>
      </div>

      {/* WAITING STATE */}
      {isVerified && verification?.userAccepted === null && (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 text-center text-blue-600 font-medium">
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

      {/* COMPLETED */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-3xl p-6 text-center text-green-600 font-medium">
          Pickup Completed Successfully
        </div>
      )}
    </div>
  );
};

export default PickupDetails;
