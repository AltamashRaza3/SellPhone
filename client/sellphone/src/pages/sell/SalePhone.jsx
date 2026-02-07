import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../../utils/axios";

/* ================= HELPERS ================= */
const normalizeToGB = (value) => {
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

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "ram" || name === "storage") {
      setForm((prev) => ({ ...prev, [name]: normalizeToGB(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = [
      "brand",
      "model",
      "condition",
      "purchaseYear",
      "phone",
      "fullAddress",
      "city",
      "state",
      "pincode",
    ];

    if (required.some((k) => !form[k])) {
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

      Object.entries({
        brand: form.brand,
        model: form.model,
        storage: form.storage,
        ram: form.ram,
        color: form.color,
        declaredCondition: form.condition,
        purchaseYear: form.purchaseYear,
        phone: form.phone,
        fullAddress: form.fullAddress,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      }).forEach(([k, v]) => formData.append(k, v));

      images.forEach((img) => formData.append("images", img));

      await api.post("/sell-requests", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Sell request submitted successfully");

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
      toast.error(err?.response?.data?.message || "Submission failed");
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
          {[
            ["brand", "Brand *"],
            ["model", "Model *"],
            ["storage", "Storage (e.g. 128GB)"],
            ["ram", "RAM (e.g. 8GB)"],
            ["color", "Color"],
          ].map(([name, label]) => (
            <input
              key={name}
              className="input"
              name={name}
              placeholder={label}
              value={form[name]}
              onChange={handleChange}
            />
          ))}

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
            placeholder="Mobile Number *"
            value={form.phone}
            onChange={handleChange}
          />

          {/* IMAGES */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-300">
              Phone Images (min 3)
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
                  className="h-24 w-full object-cover rounded-lg"
                />
              ))}
            </div>
          </div>

          <textarea
            className="input md:col-span-2"
            name="fullAddress"
            placeholder="Full Address *"
            value={form.fullAddress}
            onChange={handleChange}
          />

          {["city", "state", "pincode"].map((k) => (
            <input
              key={k}
              className="input"
              name={k}
              placeholder={`${k[0].toUpperCase()}${k.slice(1)} *`}
              value={form[k]}
              onChange={handleChange}
            />
          ))}

          <button disabled={loading} className="btn-primary md:col-span-2 py-3">
            {loading ? "Submitting…" : "Submit Sell Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SalePhone;
