import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import riderApi from "../api/riderApi";
import { FiPhoneCall, FiCamera } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const PickupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);

  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

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

  if (loading) return <div className="p-4">Loading…</div>;
  if (!pickup) return <div className="p-4">Pickup not found</div>;

  const { phone, pickup: p, contact, expectedPrice } = pickup;

  /* ================= FILE SELECT ================= */
  const handleFileSelect = (e) => {
    setImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  /* ================= CAMERA CAPTURE ================= */
  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImages((prev) => [...prev, file]);
    }
  };

  /* ================= IMAGE UPLOAD ================= */
  const uploadImages = async () => {
    if (images.length === 0) {
      alert("Capture or select at least one image");
      return;
    }

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    setUploading(true);
    try {
      await riderApi.post(`/pickups/${id}/upload-images`, formData);
      setImages([]);
      alert("Images uploaded successfully");
      await loadPickup();
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ================= ACCEPT & COMPLETE ================= */
  const acceptAndComplete = async () => {
    const allChecked = Object.values(checks).every(Boolean);
    if (!allChecked) {
      alert("Please verify all device checks");
      return;
    }

    try {
      if (p.status === "Scheduled") {
        await riderApi.put(`/pickups/${id}/picked`, {
          notes: "Device verified by rider",
        });
      }

      await riderApi.put(`/pickups/${id}/complete`);
      navigate("/pickups");
    } catch (err) {
      alert(err.response?.data?.message || "Cannot complete pickup");
    }
  };

  /* ================= REJECT ================= */
  const rejectPickup = async () => {
    if (!rejectReason.trim()) {
      alert("Enter rejection reason");
      return;
    }

    await riderApi.put(`/pickups/${id}/reject`, {
      reason: rejectReason,
    });

    navigate("/pickups");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-4">
      <button onClick={() => navigate("/pickups")} className="text-blue-600">
        ← Back
      </button>

      {/* DEVICE */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold text-lg">
          {phone.brand} {phone.model}
        </h2>
        <p className="text-sm text-gray-500">
          {phone.storage} • {phone.color} • {phone.condition}
        </p>
        <p className="mt-2 text-green-600 font-semibold">
          Expected Price: ₹{expectedPrice}
        </p>
      </div>

      {/* ADDRESS */}
      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500 mb-1">Pickup Address</p>
        <p className="text-sm">
          {p.address.line1}, {p.address.city}, {p.address.state} –{" "}
          {p.address.pincode}
        </p>
      </div>

      {/* CONTACT */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex gap-3">
          <a
            href={`tel:${contact.phone}`}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded"
          >
            <FiPhoneCall /> Call
          </a>
          <a
            href={`https://wa.me/91${contact.phone}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white py-2 rounded"
          >
            <FaWhatsapp /> WhatsApp
          </a>
        </div>
      </div>

      {/* CHECKLIST */}
      <div className="bg-white p-4 rounded shadow space-y-2">
        <p className="font-medium">Device Verification</p>
        {Object.keys(checks).map((key) => (
          <label key={key} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={checks[key]}
              onChange={(e) =>
                setChecks({ ...checks, [key]: e.target.checked })
              }
            />
            {key.charAt(0).toUpperCase() + key.slice(1)} working
          </label>
        ))}
      </div>

      {/* IMAGE UPLOAD */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <p className="font-medium">Upload / Capture Images</p>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
        />

        <button
          onClick={() => cameraInputRef.current.click()}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-2 rounded"
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
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {uploading ? "Uploading…" : "Upload Images"}
        </button>
      </div>

      {/* ACCEPT */}
      <button
        onClick={acceptAndComplete}
        className="w-full bg-green-600 text-white py-3 rounded font-semibold"
      >
        Accept & Complete Pickup
      </button>

      {/* REJECT */}
      <div className="bg-white p-4 rounded shadow space-y-2">
        <textarea
          placeholder="Reason for rejection"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="w-full border rounded p-2 text-sm"
        />
        <button
          onClick={rejectPickup}
          className="w-full bg-red-600 text-white py-2 rounded"
        >
          Reject Pickup
        </button>
      </div>
    </div>
  );
};

export default PickupDetails;
