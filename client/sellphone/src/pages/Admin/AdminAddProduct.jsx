import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import API_BASE_URL from "../../config/api";


/* ===== LOCKED ENUMS ===== */
const CONDITIONS = ["Like New", "Excellent", "Good", "Fair"];
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

const AdminAddProduct = ({
  mode = "add", 
  initialData = null,
  onSave,
  onDelete,
}) => {
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
    images: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ================= PREFILL (EDIT MODE) ================= */
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        brand: initialData.brand || "",
        model: initialData.model || "",
        price: initialData.price || "",
        storage: initialData.storage || "",
        condition: initialData.condition || "",
        color: initialData.color || "",
        ram: initialData.ram || "",
        description: initialData.description || "",
        images: (initialData.images || []).join(", "),
      });
    }
  }, [mode, initialData]);

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const e = {};

    if (!form.brand) e.brand = "Brand is required";
    if (!form.model) e.model = "Model is required";
    if (!form.price || Number(form.price) <= 0)
      e.price = "Valid price required";
    if (!form.storage) e.storage = "Storage required";
    if (!CONDITIONS.includes(form.condition))
      e.condition = "Select valid condition";
    if (!form.color.trim()) e.color = "Color is required";
    if (!form.ram.trim()) e.ram = "RAM is required";

    const imgs = form.images
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    if (imgs.length === 0) e.images = "At least one image URL is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    const payload = {
      brand: form.brand,
      model: form.model.trim(),
      price: Number(form.price),
      storage: form.storage,
      condition: form.condition,
      color: form.color.trim(),
      ram: form.ram.trim(),
      description: form.description || undefined,
      images: form.images
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
    };

    setLoading(true);

    try {
      if (mode === "edit") {
        await onSave(payload);
      } else {
        const res = await fetch(`${API_BASE_URL}/api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...payload, status: "Published" }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        toast.success("Product created successfully");
        navigate("/admin/products");
      }
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">
        {mode === "edit" ? "Edit Product" : "Add New Product"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-black/60 p-6 rounded-xl"
      >
        {/* BRAND */}
        <select
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="w-full p-3 bg-black border border-white/20 rounded"
        >
          <option value="">Select Brand</option>
          {BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        {errors.brand && <p className="text-red-400">{errors.brand}</p>}

        <input
          placeholder="Model"
          value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
          className="w-full p-3 bg-black border border-white/20 rounded"
        />

        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full p-3 bg-black border border-white/20 rounded"
        />

        <select
          value={form.storage}
          onChange={(e) => setForm({ ...form, storage: e.target.value })}
          className="w-full p-3 bg-black border border-white/20 rounded"
        >
          <option value="">Select Storage</option>
          {STORAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={form.condition}
          onChange={(e) => setForm({ ...form, condition: e.target.value })}
          className="w-full p-3 bg-black border border-white/20 rounded"
        >
          <option value="">Select Condition</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.condition && <p className="text-red-400">{errors.condition}</p>}

        {/* COLOR (FREE TEXT REQUIRED) */}
        <input
          placeholder="Color (e.g. Jungle Green)"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          className="w-full p-3 bg-black border border-white/20 rounded"
        />
        {errors.color && <p className="text-red-400">{errors.color}</p>}

        {/* RAM REQUIRED */}
        <input
          placeholder="RAM (e.g. 8GB, 12GB)"
          value={form.ram}
          onChange={(e) => setForm({ ...form, ram: e.target.value })}
          className="w-full p-3 bg-black border border-white/20 rounded"
        />
        {errors.ram && <p className="text-red-400">{errors.ram}</p>}

        <input
          placeholder="Image URLs (comma separated)"
          value={form.images}
          onChange={(e) => setForm({ ...form, images: e.target.value })}
          className="w-full p-3 bg-black border border-white/20 rounded"
        />
        {errors.images && <p className="text-red-400">{errors.images}</p>}

        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full p-3 bg-black border border-white/20 rounded"
        />

        <button
          disabled={loading}
          className="w-full bg-orange-500 py-3 rounded font-semibold"
        >
          {loading
            ? "Saving..."
            : mode === "edit"
              ? "Update Product"
              : "Create Product"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={onDelete}
            className="w-full bg-red-500 py-2 rounded"
          >
            Delete Product
          </button>
        )}
      </form>
    </div>
  );
};

export default AdminAddProduct;
