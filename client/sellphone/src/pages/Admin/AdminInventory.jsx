import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [priceMap, setPriceMap] = useState({});
  const [imageMap, setImageMap] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  /* ================= FETCH INVENTORY ================= */
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/inventory", {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      toast.error("Failed to load inventory");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  /* ================= UPDATE PRICE ================= */
  const updatePrice = async (item) => {
    const sellingPrice = Number(priceMap[item._id]);

    if (!sellingPrice || sellingPrice <= 0) {
      toast.error("Enter a valid selling price");
      return;
    }

    try {
      setUpdatingId(item._id);

      const res = await fetch(
        `http://localhost:5000/api/admin/inventory/${item._id}/price`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sellingPrice }),
        },
      );

      if (!res.ok) throw new Error();
      toast.success("Selling price updated");
      fetchInventory();
    } catch {
      toast.error("Price update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ================= UPDATE IMAGES ================= */
  const updateImages = async (item) => {
    const files = imageMap[item._id];
    if (!files || files.length === 0) {
      toast.error("Select at least one image");
      return;
    }

    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));

    try {
      setUpdatingId(item._id);

      const res = await fetch(
        `http://localhost:5000/api/admin/inventory/${item._id}/images`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        },
      );

      if (!res.ok) throw new Error();
      toast.success("Images updated");
      setImageMap((p) => ({ ...p, [item._id]: [] }));
      fetchInventory();
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (item, status) => {
    try {
      setUpdatingId(item._id);

      const res = await fetch(
        `http://localhost:5000/api/admin/inventory/${item._id}/status`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      if (!res.ok) throw new Error();
      toast.success(
        status === "Available" ? "Product listed" : "Product unlisted",
      );
      fetchInventory();
    } catch {
      toast.error("Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p className="text-gray-400">Loading inventory…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Inventory</h1>

      {items.map((item) => {
        const phone = item.phone;
        const margin =
          item.sellingPrice != null
            ? item.sellingPrice - item.purchasePrice
            : null;

        const canList = phone.images?.length > 0 && item.sellingPrice > 0;

        return (
          <div key={item._id} className="glass-card space-y-4">
            {/* HEADER */}
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {phone.brand} {phone.model}
                </h3>
                <p className="text-sm text-gray-400">
                  {phone.storage} • {phone.color} • {phone.condition}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs bg-zinc-700 text-white">
                {item.status}
              </span>
            </div>

            {/* IMAGES */}
            <div className="grid grid-cols-4 gap-2">
              {phone.images?.map((img, i) => (
                <img
                  key={i}
                  src={`http://localhost:5000${img}`}
                  className="h-20 w-full object-cover rounded"
                  alt="Product"
                />
              ))}
            </div>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setImageMap((p) => ({
                  ...p,
                  [item._id]: Array.from(e.target.files),
                }))
              }
            />

            <button
              onClick={() => updateImages(item)}
              disabled={updatingId === item._id}
              className="h-10 w-full bg-indigo-600 text-white rounded"
            >
              Update Images
            </button>

            {/* PRICING */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-400">Purchase</p>
                <p className="text-white">₹{item.purchasePrice}</p>
              </div>

              <div>
                <p className="text-gray-400">Selling</p>
                <p className="text-white">
                  {item.sellingPrice ? `₹${item.sellingPrice}` : "—"}
                </p>
              </div>

              {margin !== null && (
                <div>
                  <p className="text-gray-400">Margin</p>
                  <p
                    className={`font-semibold ${
                      margin >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    ₹{margin}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Selling price"
                value={priceMap[item._id] || ""}
                onChange={(e) =>
                  setPriceMap((p) => ({
                    ...p,
                    [item._id]: e.target.value,
                  }))
                }
                className="flex-1 h-10 bg-black/40 border border-white/10 px-3 rounded text-white"
              />

              <button
                onClick={() => updatePrice(item)}
                disabled={updatingId === item._id}
                className="h-10 px-5 bg-orange-600 text-white rounded"
              >
                Save Price
              </button>
            </div>

            {/* STATUS ACTIONS */}
            {item.status === "Draft" && (
              <button
                disabled={!canList}
                onClick={() => updateStatus(item, "Available")}
                className="h-10 w-full bg-green-600 text-white rounded disabled:opacity-50"
              >
                List Product
              </button>
            )}

            {item.status === "Available" && (
              <button
                onClick={() => updateStatus(item, "Unlisted")}
                className="h-10 w-full bg-red-600 text-white rounded"
              >
                Unlist Product
              </button>
            )}

            {item.status === "Unlisted" && (
              <button
                disabled={!canList}
                onClick={() => updateStatus(item, "Available")}
                className="h-10 w-full bg-green-600 text-white rounded disabled:opacity-50"
              >
                Relist Product
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminInventory;
