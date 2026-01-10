import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  addProductAndPublish,
  updateProductAndPublish,
  deleteProductAndPublish,
} from "../../redux/slices/adminProductsSlice";
import { toast } from "react-hot-toast";

const AdminProductForm = ({ mode = "create", initialData = {}, onSuccess }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    brand: initialData.brand || "",
    model: initialData.model || "",
    price: initialData.price || "",
    isActive: initialData.isActive ?? true,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "edit") {
        dispatch(
          updateProductAndPublish({
            ...initialData,
            ...form,
          })
        );
        toast.success("Product updated");
      } else {
        dispatch(
          addProductAndPublish({
            _id: Date.now().toString(),
            ...form,
          })
        );
        toast.success("Product added");
      }

      onSuccess?.();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this product permanently?")) return;

    dispatch(deleteProductAndPublish(initialData._id));
    toast.success("Product deleted");
    onSuccess?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl bg-black/40 p-6 rounded-xl space-y-4 text-white"
    >
      <h1 className="text-2xl font-semibold">
        {mode === "edit" ? "Edit Product" : "Add Product"}
      </h1>

      <input
        name="brand"
        value={form.brand}
        onChange={handleChange}
        placeholder="Brand"
        className="w-full p-3 rounded bg-black/50 border border-white/10"
        required
      />

      <input
        name="model"
        value={form.model}
        onChange={handleChange}
        placeholder="Model"
        className="w-full p-3 rounded bg-black/50 border border-white/10"
        required
      />

      <input
        name="price"
        type="number"
        value={form.price}
        onChange={handleChange}
        placeholder="Price"
        className="w-full p-3 rounded bg-black/50 border border-white/10"
        required
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
        />
        Visible on Home
      </label>

      <div className="flex gap-4 pt-4">
        <button
          disabled={loading}
          className="px-6 py-3 rounded bg-indigo-600 hover:bg-indigo-700 font-semibold"
        >
          {loading ? "Saving..." : "Save"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-3 rounded bg-red-600/30 hover:bg-red-600/50 text-red-400"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
};

export default AdminProductForm;
