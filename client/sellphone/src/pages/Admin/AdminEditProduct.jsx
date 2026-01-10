import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import AdminAddProduct from "./AdminAddProduct";
import {
  updateProductAndPublish,
  deleteProductAndPublish,
} from "../../redux/slices/adminProductsSlice";
import { toast } from "react-hot-toast";

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const product = useSelector((state) =>
    state.adminProducts.products.find((p) => p._id === id)
  );

  if (!product) {
    return <div className="p-6 text-white">Product not found</div>;
  }

  const onSave = (data) => {
    dispatch(updateProductAndPublish({ ...product, ...data }));
    toast.success("Product updated");
    navigate("/admin/products");
  };

  const onDelete = () => {
    if (!window.confirm("Delete this product permanently?")) return;
    dispatch(deleteProductAndPublish(product._id));
    toast.success("Product deleted");
    navigate("/admin/products");
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
