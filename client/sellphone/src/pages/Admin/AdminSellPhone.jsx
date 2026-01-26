import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AssignRider from "../../components/Admin/AssignRider";

/* ================= ADMIN STATUS UI MAP ================= */
const STATUS_BADGE = {
  Pending: "bg-yellow-500/20 text-yellow-400",
  Approved: "bg-green-500/20 text-green-400",
  Rejected: "bg-red-500/20 text-red-400",
};

const AdminSellPhones = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});

  /* ================= FETCH ================= */
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/sell-requests", {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setRequests(await res.json());
    } catch {
      toast.error("Failed to load sell requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* ================= UPDATE ADMIN STATUS ================= */
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
            remarks: notes[id] || "",
          }),
        },
      );

      if (!res.ok) throw new Error();
      const updated = await res.json();

      setRequests((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r)),
      );

      setNotes((prev) => ({ ...prev, [id]: "" }));
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) return <p className="text-gray-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Sell Requests</h1>

      {requests.map((req) => {
        const phone = req.phone || {};
        const address = req.pickup?.address;
        const adminStatus = req.admin?.status || "Pending";

        return (
          <div key={req._id} className="glass-card space-y-4">
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {phone.brand} {phone.model}
                </h3>
                <p className="text-sm text-gray-400">
                  {phone.storage} • {phone.declaredCondition}
                </p>
                <p className="mt-1 text-orange-400 font-semibold">
                  Base Price ₹{req.pricing?.basePrice}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  STATUS_BADGE[adminStatus]
                }`}
              >
                {adminStatus}
              </span>
            </div>

            {/* SELLER */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400">Seller</p>
              <p className="text-white">{req.user?.email}</p>
            </div>

            {/* PICKUP ADDRESS */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm font-semibold text-gray-400 mb-1">
                Pickup Address
              </p>
              {address ? (
                <>
                  <p className="text-sm text-white">{address.line1}</p>
                  <p className="text-sm text-gray-300">
                    {address.city}, {address.state} – {address.pincode}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Address not provided</p>
              )}
            </div>

            {/* ADMIN ACTIONS */}
            {adminStatus === "Pending" && (
              <div className="bg-black/30 p-4 rounded-xl space-y-3">
                <textarea
                  rows={2}
                  placeholder="Internal admin notes"
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
                </div>
              </div>
            )}

            {/* ASSIGN RIDER */}
            {adminStatus === "Approved" && !req.assignedRider && (
              <AssignRider requestId={req._id} onAssigned={fetchRequests} />
            )}

            {/* ASSIGNED RIDER */}
            {req.assignedRider && (
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-sm font-semibold text-indigo-400">
                  Pickup Assigned
                </p>
                <p className="text-white">{req.assignedRider.riderName}</p>
                {req.pickup?.scheduledAt && (
                  <p className="text-gray-300">
                    {new Date(req.pickup.scheduledAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminSellPhones;
