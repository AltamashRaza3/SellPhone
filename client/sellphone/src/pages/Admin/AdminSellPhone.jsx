import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const STATUS_BADGE = {
  Pending: "bg-yellow-500/20 text-yellow-400",
  "In Review": "bg-blue-500/20 text-blue-400",
  Approved: "bg-green-500/20 text-green-400",
  Rejected: "bg-red-500/20 text-red-400",
};

const AdminSellPhones = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/sell-requests", {
        credentials: "include",
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load sell requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/sell-requests/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            note: notes[id] || "",
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      const updated = await res.json();

      // ✅ Update from backend response (source of truth)
      setRequests((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r)),
      );

      setNotes((prev) => ({ ...prev, [id]: "" }));
      toast.success(`Marked as ${status}`);
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };

  if (loading) {
    return <p className="text-gray-400">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Sell Requests</h1>

      {requests.map((req) => {
        if (!req) return null;

        const phone = req.phone || {};
        const images = Array.isArray(phone.images) ? phone.images : [];

        // ✅ BACKWARD + FORWARD ADDRESS SUPPORT
        const address =
          req.pickup?.address ||
          (req.pickupAddress && {
            line1: req.pickupAddress.fullAddress,
            line2: req.pickupAddress.landmark || "",
            city: req.pickupAddress.city,
            state: req.pickupAddress.state,
            pincode: req.pickupAddress.pincode,
          }) ||
          null;

        return (
          <div key={req._id} className="glass-card space-y-4">
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {phone.brand || "—"} {phone.model || ""}
                </h3>
                <p className="text-sm text-gray-400">
                  {phone.storage || "—"} • {phone.ram || "—"} •{" "}
                  {phone.color || "—"} • {phone.condition || "—"}
                </p>
                <p className="mt-1 text-orange-400 font-semibold">
                  Expected ₹{req.expectedPrice || "—"}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  STATUS_BADGE[req.status] || STATUS_BADGE.Pending
                }`}
              >
                {req.status || "Pending"}
              </span>
            </div>

            {/* SELLER */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400">Seller</p>

              <p className="text-white">{req.contact?.email || "—"}</p>

              {req.contact?.phone ? (
                <a
                  href={`https://wa.me/91${req.contact.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-400 underline"
                >
                  +91 {req.contact.phone}
                </a>
              ) : (
                <p className="text-gray-500">Phone not available</p>
              )}
            </div>

            {/* PICKUP ADDRESS */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm font-semibold text-gray-400 mb-1">
                Pickup Address
              </p>

              {address ? (
                <>
                  <p className="text-sm text-white">
                    {[address.line1, address.line2].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-sm text-gray-300">
                    {[address.city, address.state].filter(Boolean).join(", ")}{" "}
                    {address.pincode && `– ${address.pincode}`}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Address not provided</p>
              )}
            </div>

            {/* IMAGES */}
            {images.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Phone Images</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {images.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="phone"
                      className="h-32 w-full object-cover rounded-lg border border-white/10"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ACTIONS */}
            {req.status !== "Approved" && req.status !== "Rejected" && (
              <div className="bg-black/30 p-4 rounded-xl space-y-3">
                <textarea
                  rows={2}
                  placeholder="Admin notes"
                  value={notes[req._id] || ""}
                  onChange={(e) =>
                    setNotes({ ...notes, [req._id]: e.target.value })
                  }
                  className="input w-full"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(req._id, "Approved")}
                    className="px-4 py-2 rounded-lg bg-green-600/20 text-green-400"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus(req._id, "Rejected")}
                    className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => updateStatus(req._id, "In Review")}
                    className="px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400"
                  >
                    Mark In Review
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminSellPhones;
