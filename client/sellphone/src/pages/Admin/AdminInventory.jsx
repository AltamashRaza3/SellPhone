import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceMap, setPriceMap] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  /* ================= FETCH INVENTORY ================= */
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/admin/inventory", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Unable to fetch inventory");
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("INVENTORY FETCH ERROR:", err);
      toast.error("Failed to load inventory");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  /* ================= SET SELLING PRICE ================= */
  const setSellingPrice = async (itemId) => {
    const sellingPrice = Number(priceMap[itemId]);

    if (!sellingPrice || sellingPrice <= 0) {
      toast.error("Enter a valid selling price");
      return;
    }

    try {
      setUpdatingId(itemId);

      const res = await fetch(
        `http://localhost:5000/api/admin/inventory/${itemId}/price`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sellingPrice }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Price update failed");
      }

      toast.success("Item listed successfully");
      setPriceMap((prev) => ({ ...prev, [itemId]: "" }));
      fetchInventory();
    } catch (err) {
      console.error("PRICE UPDATE ERROR:", err);
      toast.error(err.message || "Failed to update price");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return <p className="text-gray-400">Loading inventory…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
        <p className="text-gray-400">No inventory items yet</p>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Inventory</h1>

      {items.map((item) => {
        const phone = item.phone || {};
        const purchasePrice = item.purchasePrice || 0;
        const sellingPrice = item.sellingPrice || null;

        const margin =
          sellingPrice !== null ? sellingPrice - purchasePrice : null;

        const statusStyles = {
          Draft: "bg-yellow-500/20 text-yellow-400",
          Available: "bg-green-500/20 text-green-400",
          Sold: "bg-blue-500/20 text-blue-400",
        };

        return (
          <div
            key={item._id}
            className="glass-card space-y-4 border border-white/10"
          >
            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {phone.brand} {phone.model}
                </h3>
                <p className="text-sm text-gray-400">
                  {phone.storage} • {phone.color} • {phone.condition}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  statusStyles[item.status] || statusStyles.Draft
                }`}
              >
                {item.status}
              </span>
            </div>

            {/* ================= PRICING ================= */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Purchase Price</p>
                <p className="text-white font-semibold">₹{purchasePrice}</p>
              </div>

              <div>
                <p className="text-gray-400">Selling Price</p>
                <p className="text-white font-semibold">
                  {sellingPrice ? `₹${sellingPrice}` : "—"}
                </p>
              </div>

              {margin !== null && (
                <div className="col-span-2">
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

            {/* ================= ACTIONS ================= */}
            {item.status === "Draft" && (
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  placeholder="Set selling price"
                  value={priceMap[item._id] || ""}
                  onChange={(e) =>
                    setPriceMap((prev) => ({
                      ...prev,
                      [item._id]: e.target.value,
                    }))
                  }
                  className="flex-1 h-10 rounded-lg bg-black/40 border border-white/10 px-3 text-white"
                />

                <button
                  onClick={() => setSellingPrice(item._id)}
                  disabled={updatingId === item._id}
                  className="h-10 px-5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold disabled:opacity-50"
                >
                  {updatingId === item._id ? "Saving…" : "List"}
                </button>
              </div>
            )}

            {item.status === "Available" && (
              <p className="text-sm text-green-400 font-semibold">
                ✔ Listed & available for sale
              </p>
            )}

            {item.status === "Sold" && (
              <p className="text-sm text-blue-400 font-semibold">
                ✔ Sold successfully
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminInventory;
