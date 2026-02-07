import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import API_BASE_URL from "../../config/api";

/* ================= HELPERS ================= */
const normalizeRam = (value) => {
  const num = value.replace(/\D/g, "");
  return num ? `${num}GB` : "";
};
const normalizeStorage = (value) => {
  const num = value.replace(/\D/g, "");
  return num ? `${num}GB` : "";
};

const SalePhone = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    storage: "",
    ram: "",
    color: "",
    condition: "Good",
    purchaseYear: "",
    phone: "",
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
  });

  /* ================= CLEANUP PREVIEWS ================= */
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  /* ================= HANDLERS ================= */
 const handleChange = (e) => {
   const { name, value } = e.target;

   if (name === "ram") {
     setForm({ ...form, ram: normalizeRam(value) });
   } else if (name === "storage") {
     setForm({ ...form, storage: normalizeStorage(value) });
   } else {
     setForm({ ...form, [name]: value });
   }
 };


  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newPreviews = files.map((f) => URL.createObjectURL(f));

    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.brand ||
      !form.model ||
      !form.condition ||
      !form.purchaseYear ||
      !form.phone ||
      !form.fullAddress ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (images.length < 3) {
      toast.error("Upload at least 3 phone images");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      /* PHONE */
      formData.append("brand", form.brand);
      formData.append("model", form.model);
      formData.append("storage", form.storage);
      formData.append("ram", form.ram);
      formData.append("color", form.color);
      formData.append("declaredCondition", form.condition);
      formData.append("purchaseYear", form.purchaseYear);

      /* CONTACT */
      formData.append("phone", form.phone);

      /* ADDRESS */
      formData.append("fullAddress", form.fullAddress);
      formData.append("city", form.city);
      formData.append("state", form.state);
      formData.append("pincode", form.pincode);

      /* IMAGES */
      images.forEach((img) => {
        formData.append("images", img);
      });

      const res = await fetch(`${API_BASE_URL}/api/sell-requests`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit request");
      }

      toast.success("Sell request submitted successfully");

      /* RESET */
      setForm({
        brand: "",
        model: "",
        storage: "",
        ram: "",
        color: "",
        condition: "Good",
        purchaseYear: "",
        phone: "",
        fullAddress: "",
        city: "",
        state: "",
        pincode: "",
      });

      setImages([]);
      setPreviews([]);
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="appContainer py-12">
      <div className="max-w-3xl mx-auto glass-card space-y-6">
        <h1 className="text-2xl font-bold text-white">Sell Your Phone</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input
            className="input"
            name="brand"
            placeholder="Brand *"
            value={form.brand}
            onChange={handleChange}
          />
          <input
            className="input"
            name="model"
            placeholder="Model *"
            value={form.model}
            onChange={handleChange}
          />
          <input
            className="input"
            name="storage"
            placeholder="Storage (e.g. 128GB)"
            value={form.storage}
            onChange={handleChange}
          />

          <input
            className="input"
            name="ram"
            placeholder="RAM (e.g. 8GB)"
            value={form.ram}
            onChange={handleChange}
          />
          <input
            className="input"
            name="color"
            placeholder="Color"
            value={form.color}
            onChange={handleChange}
          />

          <select
            className="input"
            name="condition"
            value={form.condition}
            onChange={handleChange}
          >
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>

          <input
            className="input"
            type="number"
            name="purchaseYear"
            placeholder="Purchase Year *"
            value={form.purchaseYear}
            onChange={handleChange}
          />
          <input
            className="input"
            name="phone"
            placeholder="Mobile Number (WhatsApp) *"
            value={form.phone}
            onChange={handleChange}
          />

          {/* IMAGES */}
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-300">
              Phone Images (Min 3 required)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
              className="input"
            />

            <div className="grid grid-cols-3 gap-3 mt-2">
              {previews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="h-24 w-full object-cover rounded-lg border border-white/10"
                />
              ))}
            </div>
          </div>

          {/* ADDRESS */}
          <textarea
            className="input md:col-span-2"
            name="fullAddress"
            placeholder="Full Address *"
            value={form.fullAddress}
            onChange={handleChange}
          />
          <input
            className="input"
            name="city"
            placeholder="City *"
            value={form.city}
            onChange={handleChange}
          />
          <input
            className="input"
            name="state"
            placeholder="State *"
            value={form.state}
            onChange={handleChange}
          />
          <input
            className="input"
            name="pincode"
            placeholder="Pincode *"
            value={form.pincode}
            onChange={handleChange}
          />

          <button disabled={loading} className="btn-primary md:col-span-2 py-3">
            {loading ? "Submitting..." : "Submit Sell Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SalePhone;
