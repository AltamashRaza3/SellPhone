import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiEdit, FiPlus } from "react-icons/fi";

const AdminProducts = () => {
  const phones = useSelector((state) => state.phones?.items || []);
  const loading = useSelector((state) => state.phones?.loading);

  if (loading) {
    return <div className="p-6 text-white text-lg">Loading products…</div>;
  }

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Products</h1>

        <Link
          to="/admin/products/add"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium"
        >
          <FiPlus />
          Add Product
        </Link>
      </div>

      {/* Empty State */}
      {phones.length === 0 ? (
        <div className="text-gray-400">
          No products found. Add your first product.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="p-3 text-left">Model</th>
                <th className="p-3 text-left">Brand</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Condition</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {phones.map((phone) => (
                <tr
                  key={phone._id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="p-3">{phone.model || "—"}</td>
                  <td className="p-3 capitalize">{phone.brand || "—"}</td>
                  <td className="p-3">₹{phone.price ?? "—"}</td>
                  <td className="p-3">{phone.condition || "—"}</td>
                  <td className="p-3">
                    <Link
                      to={`/admin/products/edit/${phone._id}`}
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                    >
                      <FiEdit />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
