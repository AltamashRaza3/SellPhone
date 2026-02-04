import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import AdminAddProduct from "./AdminAddProduct";
import { fetchAdminProducts } from "../../redux/slices/adminProductsSlice";
import { API_BASE_URL } from "../../config/api";

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { products, loading } = useSelector((state) => state.adminProducts);

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchAdminProducts());
    }
  }, [dispatch, products.length]);

  const product = products.find((p) => p._id === id);

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  if (!product) {
    return <div className="p-6 text-red-400">Product not found</div>;
  }

  /* ================= SAVE ================= */
  const onSave = async (data) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/products/${product._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        },
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success("Product updated");
      dispatch(fetchAdminProducts());
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };

  /* ================= DELETE ================= */
  const onDelete = async () => {
    if (!window.confirm("Delete this product permanently?")) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/products/${product._id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success("Product deleted");
      dispatch(fetchAdminProducts());
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  return (
    <AdminAddProduct
      mode="edit"
      initialData={product}
      onSave={onSave}
      onDelete={onDelete}
    />
  );
};

export default AdminEditProduct;
