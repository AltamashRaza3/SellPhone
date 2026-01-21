import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import riderApi from "../api/riderApi";
import { FiPhoneCall } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const PickupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imagesUploaded, setImagesUploaded] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center">
        Loading pickup details…
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Pickup not found
      </div>
    );
  }

  const { phone, pickup: p, contact, expectedPrice, verification } = pickup;

  /* ================= IMAGE UPLOAD ================= */
  const uploadImages = async () => {
    if (images.length === 0) {
      alert("Select at least one image");
      return;
    }

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    setUploading(true);
    try {
      await riderApi.post(`/pickups/${id}/upload-images`, formData);
      setImages([]);
      setImagesUploaded(true);
      await loadPickup();
      alert("Images uploaded successfully");
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

    if (!verification?.images?.length && !imagesUploaded) {
      alert("Upload device images before completing");
      return;
    }

    try {
      // Step 1: Mark picked (ONLY if still scheduled)
      if (p.status === "Scheduled") {
        await riderApi.put(`/pickups/${id}/picked`, {
          notes: "Device verified by rider",
        });
      }

      // Step 2: Complete
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
          {p.address.line1}
          <br />
          {p.address.city}, {p.address.state} – {p.address.pincode}
        </p>
      </div>

      {/* CONTACT */}
      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500 mb-2">Customer</p>
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
        <p className="font-medium">Upload Device Images</p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages([...e.target.files])}
        />
        <button
          disabled={uploading || images.length === 0}
          onClick={uploadImages}
          className={`w-full py-2 rounded ${
            uploading || images.length === 0
              ? "bg-gray-300"
              : "bg-blue-600 text-white"
          }`}
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
        <p className="text-red-600 font-medium">Reject Pickup</p>
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
