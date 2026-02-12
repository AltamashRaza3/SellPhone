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

      await api.post("/sell-requests", formData);

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
    <div className="bg-[#f5f5f7] min-h-screen py-24">
      {/* TRUE CENTER WRAPPER */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-2xl px-6 space-y-16">
          {/* HEADER */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
              Sell Your Phone
            </h1>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              Get the best value for your device. Free pickup. Instant
              evaluation.
            </p>
          </div>

          {/* FORM CARD */}
          <div className="bg-white rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.06)] p-12 md:p-14 space-y-12">
            <form onSubmit={handleSubmit} className="space-y-14">
              {/* DEVICE DETAILS */}
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-gray-900">
                  Device Details
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    ["brand", "Brand *"],
                    ["model", "Model *"],
                    ["storage", "Storage (e.g. 128GB)"],
                    ["ram", "RAM (e.g. 8GB)"],
                    ["color", "Color"],
                  ].map(([name, label]) => (
                    <input
                      key={name}
                      name={name}
                      placeholder={label}
                      value={form[name]}
                      onChange={handleChange}
                      className="apple-input"
                    />
                  ))}

                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    className="apple-input"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>

                  <input
                    type="number"
                    name="purchaseYear"
                    placeholder="Purchase Year *"
                    value={form.purchaseYear}
                    onChange={handleChange}
                    className="apple-input"
                  />
                </div>
              </div>

              {/* IMAGES */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Upload Images
                </h2>

                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center bg-gray-50 hover:bg-gray-100 transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImages}
                    className="hidden"
                    id="upload"
                  />
                  <label
                    htmlFor="upload"
                    className="cursor-pointer text-gray-500 text-sm"
                  >
                    Click to upload up to 5 images (min 3 required)
                  </label>
                </div>

                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {previews.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        className="h-28 w-full object-cover rounded-2xl shadow-sm"
                        alt="preview"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* PICKUP DETAILS */}
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-gray-900">
                  Pickup Details
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  <input
                    name="phone"
                    placeholder="Mobile Number *"
                    value={form.phone}
                    onChange={handleChange}
                    className="apple-input"
                  />
                  <input
                    name="city"
                    placeholder="City *"
                    value={form.city}
                    onChange={handleChange}
                    className="apple-input"
                  />
                  <input
                    name="state"
                    placeholder="State *"
                    value={form.state}
                    onChange={handleChange}
                    className="apple-input"
                  />
                  <input
                    name="pincode"
                    placeholder="Pincode *"
                    value={form.pincode}
                    onChange={handleChange}
                    className="apple-input"
                  />
                </div>

                <textarea
                  name="fullAddress"
                  placeholder="Full Address *"
                  value={form.fullAddress}
                  onChange={handleChange}
                  className="apple-input min-h-[120px]"
                />
              </div>

              {/* SUBMIT */}
              <button
                disabled={loading}
                className="w-full py-4 rounded-full bg-black text-white font-medium text-lg hover:scale-[1.02] transition disabled:opacity-50"
              >
                {loading ? "Submitting…" : "Submit Sell Request"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalePhone;
