import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";

const API = "http://localhost:5000";

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceMap, setPriceMap] = useState({});
  const [imageMap, setImageMap] = useState({});
  const [actionId, setActionId] = useState(null);

  /* ================= FETCH INVENTORY ================= */
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/inventory`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  /* ================= UPDATE IMAGES ================= */
  const updateImages = async (item) => {
    const files = imageMap[item._id];
    if (!files?.length) return toast.error("Select images first");

    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));

    try {
      setActionId(item._id);
      const res = await fetch(`${API}/api/admin/inventory/${item._id}/images`, {
        method: "PUT",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) throw new Error();
      toast.success("Images updated");
      fetchInventory();
    } catch {
      toast.error("Image update failed");
    } finally {
      setActionId(null);
    }
  };

  /* ================= PUBLISH ================= */
  const publishItem = async (item) => {
    const price = Number(priceMap[item._id]);
    if (!price || price <= 0) return toast.error("Enter valid price");

    try {
      setActionId(item._id);
      const res = await fetch(
        `${API}/api/admin/inventory/${item._id}/publish`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price }),
        },
      );
      if (!res.ok) throw new Error();
      toast.success("Product published");
      fetchInventory();
    } catch {
      toast.error("Publish failed");
    } finally {
      setActionId(null);
    }
  };

  /* ================= UPDATE PRICE ================= */
  const updatePrice = async (item) => {
    const price = Number(priceMap[item._id]);
    if (!price || price <= 0) return toast.error("Enter valid price");

    try {
      setActionId(item._id);
      const res = await fetch(`${API}/api/admin/inventory/${item._id}/price`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      if (!res.ok) throw new Error();
      toast.success("Price updated");
      fetchInventory();
    } catch {
      toast.error("Price update failed");
    } finally {
      setActionId(null);
    }
  };

  /* ================= LIST / UNLIST ================= */
  const toggleListing = async (item, status) => {
    try {
      setActionId(item._id);
      const res = await fetch(`${API}/api/admin/inventory/${item._id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        status === "Published" ? "Product listed" : "Product unlisted",
      );
      fetchInventory();
    } catch {
      toast.error("Status update failed");
    } finally {
      setActionId(null);
    }
  };

  /* ================= SOLD ================= */
  const markSold = async (item) => {
    if (!window.confirm("Mark item as sold?")) return;

    try {
      setActionId(item._id);
      const res = await fetch(`${API}/api/admin/inventory/${item._id}/sold`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast.success("Marked as sold");
      fetchInventory();
    } catch {
      toast.error("Failed to mark sold");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-400">Loading inventory…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Inventory</h1>

      {items.map((item) => {
        const phone = item.phone;
        const ownsProduct = Boolean(item.productId);
        const isInStock = item.status === "InStock";
        const isPublished = item.status === "Published";

        return (
          <div key={item._id} className="glass-card space-y-4">
            {/* HEADER */}
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {phone.brand} {phone.model}
                </h3>
                <p className="text-sm text-gray-400">
                  {phone.storage} • {phone.ram} • {phone.color} •{" "}
                  {phone.condition}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs bg-zinc-700">
                {item.status}
              </span>
            </div>

            {/* IMAGES */}
            <div className="grid grid-cols-4 gap-2">
              {phone.images?.map((img, i) => (
                <img
                  key={i}
                  src={`${API}${img}`}
                  className="h-20 w-full object-cover rounded"
                  alt=""
                />
              ))}
            </div>

            <input
              type="file"
              multiple
              onChange={(e) =>
                setImageMap((p) => ({
                  ...p,
                  [item._id]: Array.from(e.target.files),
                }))
              }
            />

            <button
              onClick={() => updateImages(item)}
              disabled={actionId === item._id}
              className="w-full bg-indigo-600 h-10 rounded text-white"
            >
              Update Images
            </button>

            {/* PRICE */}
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
                className="flex-1 h-10 bg-black/40 border px-3 rounded text-white"
              />

              {isInStock && (
                <button
                  onClick={() => publishItem(item)}
                  className="bg-green-600 px-5 rounded text-white"
                >
                  Publish
                </button>
              )}

              {isPublished && ownsProduct && (
                <button
                  onClick={() => updatePrice(item)}
                  className="bg-orange-600 px-5 rounded text-white"
                >
                  Update Price
                </button>
              )}
            </div>

            {/* LIST / UNLIST */}
            {isPublished && ownsProduct && (
              <>
                <button
                  onClick={() => toggleListing(item, "Unlisted")}
                  className="w-full bg-yellow-600 h-10 rounded text-white"
                >
                  Unlist Product
                </button>

                <button
                  onClick={() => toggleListing(item, "Published")}
                  className="w-full bg-green-600 h-10 rounded text-white"
                >
                  Relist Product
                </button>

                <button
                  onClick={() => markSold(item)}
                  className="w-full bg-red-600 h-10 rounded text-white"
                >
                  Mark Sold
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminInventory;
