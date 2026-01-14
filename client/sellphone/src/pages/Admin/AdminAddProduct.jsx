import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-hot-toast";

const AdminAddProduct = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    brand: "",
    model: "",
    price: "",
    storage: "",
    condition: "",
    color: "",
    ram: "",
    description: "",
    image: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ---------------- OPTIONS ---------------- */
  const BRANDS = [
    "Apple",
    "Samsung",
    "Xiaomi",
    "OnePlus",
    "Oppo",
    "Vivo",
    "Realme",
    "Google",
    "Motorola",
    "Nothing",
  ];

  const STORAGES = ["64GB", "128GB", "256GB", "512GB", "1TB"];

  const CONDITIONS = ["Like New", "Excellent", "Good", "Fair"];

  const COLORS = ["Black", "White", "Blue", "Green", "Red", "Silver", "Gold"];

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const e = {};

    if (!form.brand) e.brand = "Brand is required";
    if (!form.model) e.model = "Model is required";
    if (!form.price || Number(form.price) <= 0)
      e.price = "Valid price required";
    if (!form.storage) e.storage = "Storage required";
    if (!form.condition) e.condition = "Condition required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    setLoading(true);

    const payload = {
      brand: form.brand,
      model: form.model.trim(),
      price: Number(form.price),
      storage: form.storage,
      condition: form.condition,
      isActive: true,
    };

    if (form.color) payload.color = form.color;
    if (form.ram) payload.ram = form.ram.trim();
    if (form.description) payload.description = form.description.trim();
    if (form.image) payload.image = form.image.trim();

    try {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Product creation failed");
      }

      toast.success("✅ Product created successfully");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Add New Product</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-black/60 p-6 rounded-xl space-y-4"
      >
        {/* BRAND */}
        <select
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className={`w-full px-4 py-3 rounded bg-black border text-white ${
            errors.brand ? "border-red-500" : "border-white/20"
          }`}
        >
          <option value="">Select Brand</option>
          {BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        {errors.brand && <p className="text-red-400 text-sm">{errors.brand}</p>}

        {/* MODEL */}
        <input
          type="text"
          placeholder="MODEL"
          value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
          className={`w-full px-4 py-3 rounded bg-black border text-white ${
            errors.model ? "border-red-500" : "border-white/20"
          }`}
        />

        {/* PRICE */}
        <input
          type="number"
          placeholder="PRICE"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className={`w-full px-4 py-3 rounded bg-black border text-white ${
            errors.price ? "border-red-500" : "border-white/20"
          }`}
        />

        {/* STORAGE */}
        <select
          value={form.storage}
          onChange={(e) => setForm({ ...form, storage: e.target.value })}
          className={`w-full px-4 py-3 rounded bg-black border text-white ${
            errors.storage ? "border-red-500" : "border-white/20"
          }`}
        >
          <option value="">Select Storage</option>
          {STORAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* CONDITION */}
        <select
          value={form.condition}
          onChange={(e) => setForm({ ...form, condition: e.target.value })}
          className={`w-full px-4 py-3 rounded bg-black border text-white ${
            errors.condition ? "border-red-500" : "border-white/20"
          }`}
        >
          <option value="">Select Condition</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* OPTIONAL */}
        <select
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          className="w-full px-4 py-3 rounded bg-black border border-white/20 text-white"
        >
          <option value="">Select Color (optional)</option>
          {COLORS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="RAM (optional)"
          value={form.ram}
          onChange={(e) => setForm({ ...form, ram: e.target.value })}
          className="w-full px-4 py-3 rounded bg-black border border-white/20 text-white"
        />

        <input
          type="text"
          placeholder="IMAGE URL (optional)"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="w-full px-4 py-3 rounded bg-black border border-white/20 text-white"
        />

        <textarea
          placeholder="DESCRIPTION (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 rounded bg-black border border-white/20 text-white"
        />

        <button
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded text-white font-semibold transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
};

export default AdminAddProduct;
