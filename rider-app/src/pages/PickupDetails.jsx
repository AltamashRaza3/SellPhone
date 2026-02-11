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
    <div className="space-y-12">
      {/* ===== Back Button ===== */}
      <button
        onClick={() => navigate("/pickups")}
        className="text-sm text-gray-500 hover:text-gray-900 transition"
      >
        ← Back to pickups
      </button>

      {/* ===== Device Info Card ===== */}
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

      {/* ===== Contact Card ===== */}
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

      {/* ===== Verification Checklist ===== */}
      {!isVerified && !isRejected && (isScheduled || isPicked) && (
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
            className="
            w-full h-14 rounded-2xl
            bg-gradient-to-r from-blue-600 to-blue-500
            text-white font-semibold
            shadow-[0_10px_30px_rgba(37,99,235,0.35)]
            hover:from-blue-700 hover:to-blue-600
            active:scale-[0.98]
            transition-all
            disabled:opacity-50
          "
          >
            {verifying ? "Verifying…" : "Verify Device"}
          </button>
        </div>
      )}

      {/* ===== Complete Pickup ===== */}
      {canComplete && (
        <button
          onClick={completePickup}
          className="
          w-full h-14 rounded-2xl
          bg-gradient-to-r from-green-600 to-green-500
          text-white font-semibold
          shadow-[0_10px_30px_rgba(22,163,74,0.35)]
          hover:from-green-700 hover:to-green-600
          active:scale-[0.98]
          transition-all
        "
        >
          Complete Pickup
        </button>
      )}

      {/* ===== Reject Card ===== */}
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
            className="
            w-full h-14 rounded-2xl
            bg-gradient-to-r from-red-600 to-red-500
            text-white font-semibold
            shadow-[0_10px_30px_rgba(220,38,38,0.35)]
            hover:from-red-700 hover:to-red-600
            active:scale-[0.98]
            transition-all
            disabled:opacity-50
          "
          >
            {rejecting ? "Escalating…" : "Reject & Escalate"}
          </button>
        </div>
      )}

      {/* ===== Completed State ===== */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-[28px] p-6 text-center text-green-600 font-medium">
          Pickup Completed Successfully
        </div>
      )}
    </div>
  );


};
export default PickupDetails;
