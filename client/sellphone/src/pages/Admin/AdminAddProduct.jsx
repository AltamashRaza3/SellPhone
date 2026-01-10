import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  addProductAndPublish,
  updateProductAndPublish,
  deleteProductAndPublish,
} from "../../redux/slices/adminProductsSlice";
import { FiImage, FiTrash2, FiX, FiSmartphone } from "react-icons/fi";

const AdminAddProduct = ({ mode = "create", initialData = {} }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* -------------------- STATE -------------------- */
  const [form, setForm] = useState({
    brand: initialData.brand || "",
    model: initialData.model || "",
    price: initialData.price || "",
    storage: initialData.storage || "",
    condition: initialData.condition || "",
    image: initialData.image || "",
    color: initialData.color || "",
    ram: initialData.ram || "",
    description: initialData.description || "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* -------------------- OPTIONS -------------------- */
  const brands = [
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
    "Poco",
    "Honor",
    "Infinix",
    "iQOO",
    "Nokia",
    "Sony",
    "Huawei",
    "Asus",
    "LG",
    "Nubia",
    "Tecno",
    "Intex",
    "Micromax",
    "Lava",
    "Karbonn",
    "iBall",
    "Lenovo",
    "Coolpad",
    "Meizu",
    "Black Shark",
    "Redmi",
    "CMF by Nothing",
    "Moto",
    "Jio",
    "Itel",
  ];

  const storages = ["64GB", "128GB", "256GB", "512GB", "1TB"];
  const conditions = ["Like New", "Excellent", "Good", "Fair"];
  const colors = [
    "Black",
    "White",
    "Blue",
    "Green",
    "Red",
    "Silver",
    "Gold",
    "Pink",
    "Purple",
  ];

  /* -------------------- VALIDATION -------------------- */
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

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }

    setLoading(true);

    const payload = {
      ...initialData,
      ...form,
      price: Number(form.price),
    };

    try {
      if (mode === "edit") {
        dispatch(updateProductAndPublish(payload));
        toast.success("✅ Product updated successfully");
      } else {
        dispatch(
          addProductAndPublish({
            _id: `PH-${Date.now()}`,
            ...payload,
            isActive: true,
            createdAt: new Date().toISOString().split("T")[0],
          })
        );
        toast.success("✅ Product added successfully");
      }

      navigate("/admin/products");
    } catch {
      toast.error("❌ Operation failed");
    } finally {
      setLoading(false);
    }
  };


  /* -------------------- DELETE -------------------- */
  const handleDelete = () => {
    if (!window.confirm("Delete this product permanently?")) return;
    dispatch(deleteProductAndPublish(initialData._id));
    toast.success("🗑️ Product deleted successfully");
    navigate("/admin/products");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-2xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 mb-4">
            <FiSmartphone className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                {mode === "edit" ? "Edit Phone" : "Add New Phone"}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {mode === "edit"
                  ? `Update ${initialData.brand || ""} ${
                      initialData.model || ""
                    }`
                  : "Fill in details for your phone listing"}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Brand */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                    Brand <span className="text-orange-400">*</span>
                  </label>
                  <select
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/70 border border-gray-600 hover:border-gray-500 
                               text-white font-medium focus:outline-none focus:border-orange-400 focus:ring-2 
                               focus:ring-orange-400/30 transition-all duration-300 appearance-none bg-no-repeat 
                               bg-[right_0.75rem_center/1.5em_auto,'/icons/chevron-down.svg'] 
                               ${errors.brand ? 'border-red-500 ring-2 ring-red-500/30' : ''}"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  {errors.brand && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <FiX className="w-4 h-4" /> {errors.brand}
                    </p>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                    Model <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="iPhone 15 Pro"
                    value={form.model}
                    onChange={(e) =>
                      setForm({ ...form, model: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/70 border border-gray-600 hover:border-gray-500 
                               text-white font-medium focus:outline-none focus:border-orange-400 focus:ring-2 
                               focus:ring-orange-400/30 transition-all duration-300 
                               ${errors.model ? 'border-red-500 ring-2 ring-red-500/30' : ''}"
                  />
                  {errors.model && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <FiX className="w-4 h-4" /> {errors.model}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                    Price <span className="text-orange-400">₹</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="45000"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800/70 border border-gray-600 hover:border-gray-500 
                                 text-white font-semibold focus:outline-none focus:border-orange-400 focus:ring-2 
                                 focus:ring-orange-400/30 transition-all duration-300 
                                 ${errors.price ? 'border-red-500 ring-2 ring-red-500/30' : ''}"
                      min="0"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <FiX className="w-4 h-4" /> {errors.price}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Storage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                    Storage <span className="text-orange-400">*</span>
                  </label>
                  <select
                    value={form.storage}
                    onChange={(e) =>
                      setForm({ ...form, storage: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/70 border border-gray-600 hover:border-gray-500 
                               text-white font-medium focus:outline-none focus:border-orange-400 focus:ring-2 
                               focus:ring-orange-400/30 transition-all duration-300 appearance-none bg-no-repeat 
                               bg-[right_0.75rem_center/1.5em_auto,'/icons/chevron-down.svg']"
                  >
                    <option value="">Select Storage</option>
                    {storages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.storage && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <FiX className="w-4 h-4" /> {errors.storage}
                    </p>
                  )}
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                    Condition <span className="text-orange-400">*</span>
                  </label>
                  <select
                    value={form.condition}
                    onChange={(e) =>
                      setForm({ ...form, condition: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/70 border border-gray-600 hover:border-gray-500 
                               text-white font-medium focus:outline-none focus:border-orange-400 focus:ring-2 
                               focus:ring-orange-400/30 transition-all duration-300 appearance-none bg-no-repeat 
                               bg-[right_0.75rem_center/1.5em_auto,'/icons/chevron-down.svg']"
                  >
                    <option value="">Select Condition</option>
                    {conditions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.condition && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <FiX className="w-4 h-4" /> {errors.condition}
                    </p>
                  )}
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                    Color
                  </label>
                  <select
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/70 border border-gray-600 hover:border-gray-500 
                               text-white font-medium focus:outline-none focus:border-orange-400 focus:ring-2 
                               focus:ring-orange-400/30 transition-all duration-300 appearance-none bg-no-repeat 
                               bg-[right_0.75rem_center/1.5em_auto,'/icons/chevron-down.svg']"
                  >
                    <option value="">Select Color</option>
                    {colors.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* RAM */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                  RAM
                </label>
                <input
                  type="text"
                  placeholder="8GB"
                  value={form.ram}
                  onChange={(e) => setForm({ ...form, ram: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/70 border border-gray-600 hover:border-gray-500 
                             text-white font-medium focus:outline-none focus:border-orange-400 focus:ring-2 
                             focus:ring-orange-400/30 transition-all duration-300"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                  Image URL
                </label>
                <div className="relative">
                  <FiImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    placeholder="https://example.com/phone.jpg"
                    value={form.image}
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/70 border border-gray-600 hover:border-gray-500 
                               text-white font-medium focus:outline-none focus:border-orange-400 focus:ring-2 
                               focus:ring-orange-400/30 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Additional details about the phone..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-gray-800/70 border border-gray-600 hover:border-gray-500 
                          text-white font-medium focus:outline-none focus:border-orange-400 focus:ring-2 
                          focus:ring-orange-400/30 transition-all duration-300 resize-vertical"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/20">
              {mode === "edit" && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 bg-gradient-to-r from-red-600/20 to-red-500/20 border border-red-400/50 
                             hover:border-red-300 hover:bg-red-600/30 text-red-300 hover:text-red-200 py-3 px-6 
                             rounded-xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <FiTrash2 className="w-5 h-5" />
                  Delete
                </button>
              )}

              <div className="flex flex-1 gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  className="flex-1 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white 
                             hover:bg-gray-800/50 py-3 px-6 rounded-xl font-semibold transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 
                             py-3 px-6 rounded-xl text-white font-semibold shadow-lg hover:shadow-orange-500/25 
                             transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
                             flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : mode === "edit" ? (
                    "Update Product"
                  ) : (
                    "Save & Publish"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddProduct;
