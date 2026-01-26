import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import riderApi from "../api/riderApi";
import { FiCamera } from "react-icons/fi";

const PickupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);

  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [checks, setChecks] = useState({
    display: false,
    battery: false,
    speaker: false,
    camera: false,
    buttons: false,
  });

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
    return (
      <div className="py-20 text-center text-zinc-400">
        Loading pickup details…
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="py-20 text-center text-zinc-400">Pickup not found</div>
    );
  }

  const { phone, pickup: p, expectedPrice, verification } = pickup;

  const isPickupScheduled = p?.status === "Scheduled" && p?.scheduledAt;

  const isVerified = verification?.checks;
  const hasImages = verification?.images?.length > 0;

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
    if (!isPickupScheduled) return;

    const hasAnyCheck = Object.values(checks).some(Boolean);
    if (!hasAnyCheck) return;

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
    if (!hasImages || !isVerified) return;

    try {
      await riderApi.put(`/pickups/${id}/complete`);
      navigate("/pickups");
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= REJECT PICKUP ================= */
  const rejectPickup = async () => {
    if (!rejectReason.trim()) return;

    try {
      await riderApi.put(`/pickups/${id}/reject`, {
        reason: rejectReason,
      });
      navigate("/pickups");
    } catch (err) {
      console.error(err);
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
      <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4">
        <h2 className="font-semibold text-lg text-white">
          {phone.brand} {phone.model}
        </h2>
        <p className="text-sm text-zinc-400 mt-0.5">
          {phone.storage} • {phone.color} • {phone.condition}
        </p>

        <div className="mt-3">
          <p className="text-emerald-400 font-semibold">
            Expected Price: ₹{expectedPrice}
          </p>
          {verification?.finalPrice && (
            <p className="text-red-400 font-semibold">
              Final Price: ₹{verification.finalPrice}
            </p>
          )}
        </div>
      </div>

      {/* SCHEDULING WARNING */}
      {!isPickupScheduled && (
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-3 text-sm text-yellow-400">
          Pickup must be scheduled before device verification.
        </div>
      )}

      {/* USER IMAGES */}
      {phone?.images?.length > 0 && (
        <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4">
          <p className="text-sm font-medium mb-3">User Uploaded Images</p>
          <div className="grid grid-cols-3 gap-2">
            {phone.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                className="w-full h-24 object-cover rounded-xl border border-white/10"
                alt="User device"
              />
            ))}
          </div>
        </div>
      )}

      {/* VERIFICATION */}
      <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 space-y-3">
        <p className="font-medium text-white">Device Verification</p>

        {Object.keys(checks).map((key) => (
          <label key={key} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={checks[key]}
              disabled={!isPickupScheduled || isVerified}
              onChange={(e) =>
                setChecks({ ...checks, [key]: e.target.checked })
              }
            />
            {key.charAt(0).toUpperCase() + key.slice(1)} working
          </label>
        ))}

        <button
          onClick={verifyDevice}
          disabled={verifying || !isPickupScheduled || isVerified}
          className={`w-full h-11 rounded-xl font-medium transition ${
            isPickupScheduled && !isVerified
              ? "bg-zinc-800 text-white"
              : "bg-zinc-900 text-zinc-500 cursor-not-allowed"
          }`}
        >
          {isVerified
            ? "Device Verified"
            : verifying
              ? "Verifying…"
              : !isPickupScheduled
                ? "Pickup not scheduled"
                : "Verify Device"}
        </button>
      </div>

      {/* IMAGE UPLOAD */}
      <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 space-y-3">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="text-sm"
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

      {/* COMPLETE */}
      <button
        onClick={completePickup}
        disabled={!isVerified || !hasImages}
        className={`w-full h-12 rounded-xl font-semibold transition ${
          isVerified && hasImages
            ? "bg-gradient-to-r from-emerald-500 to-green-600 text-black"
            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
        }`}
      >
        Complete Pickup
      </button>

      {/* REJECT */}
      <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 space-y-3">
        <textarea
          placeholder="Reason for rejection"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="w-full rounded-xl bg-zinc-800 border border-white/10 p-3 text-sm text-white"
        />
        <button
          onClick={rejectPickup}
          disabled={!rejectReason.trim()}
          className="w-full h-11 rounded-xl bg-red-600 text-white disabled:opacity-50"
        >
          Reject Pickup
        </button>
      </div>
    </div>
  );
};

export default PickupDetails;
