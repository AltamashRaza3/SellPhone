import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AssignRider from "../../components/Admin/AssignRider";

const AdminSellPhones = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [remarks, setRemarks] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

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

  /* ================= ADMIN ACTION ================= */
  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const res = await fetch(
        `http://localhost:5000/api/admin/sell-requests/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            status,
            remarks: remarks[id] || "",
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setUpdatingId(null);
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
        const pickupStatus = req.pickup?.status;

        const isEscalated = pickupStatus === "Rejected";

        const canApproveReject =
          adminStatus === "Pending" && !req.assignedRider;

        const canAssignRider = adminStatus === "Approved" && !req.assignedRider;

        const canReassign = adminStatus === "Approved" && isEscalated;

        const riderRejection = req.statusHistory?.find(
          (h) =>
            h.status === "Pickup Rejected by Rider" && h.changedBy === "rider",
        );

        return (
          <div
            key={req._id}
            className={`glass-card space-y-4 ${
              isEscalated ? "ring-1 ring-red-500/40" : ""
            }`}
          >
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
                  Base Price ₹{req.pricing?.basePrice?.toLocaleString("en-IN")}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    isEscalated
                      ? "bg-red-600/20 text-red-400"
                      : adminStatus === "Approved"
                        ? "bg-green-500/20 text-green-400"
                        : adminStatus === "Rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                  }`}
              >
                {isEscalated ? "Escalated" : adminStatus}
              </span>
            </div>

            {/* USER IMAGES */}
            {phone.images?.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {phone.images.map((img, i) => (
                  <img
                    key={i}
                    src={`http://localhost:5000${img}`}
                    alt="Phone"
                    className="h-28 w-full object-cover rounded-lg border border-white/10"
                  />
                ))}
              </div>
            )}

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

            {/* 🚨 ESCALATION DETAILS */}
            {isEscalated && riderRejection && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm font-semibold text-red-400">
                  Rider Escalation Reason
                </p>
                <p className="text-sm text-red-300 mt-1">
                  {riderRejection.note}
                </p>
              </div>
            )}

            {/* ADMIN ACTIONS */}
            {canApproveReject && (
              <div className="space-y-3">
                <textarea
                  placeholder="Remarks (optional)"
                  value={remarks[req._id] || ""}
                  onChange={(e) =>
                    setRemarks({ ...remarks, [req._id]: e.target.value })
                  }
                  className="w-full rounded-lg bg-black/40 border border-white/10 p-3 text-sm text-white"
                />

                <div className="flex gap-3">
                  <button
                    disabled={updatingId === req._id}
                    onClick={() => updateStatus(req._id, "Approved")}
                    className="flex-1 h-10 rounded-lg bg-green-600 text-white font-semibold"
                  >
                    Approve
                  </button>

                  <button
                    disabled={updatingId === req._id}
                    onClick={() => updateStatus(req._id, "Rejected")}
                    className="flex-1 h-10 rounded-lg bg-red-600 text-white font-semibold"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {/* ASSIGN / REASSIGN RIDER */}
            {(canAssignRider || canReassign) && (
              <AssignRider requestId={req._id} onAssigned={fetchRequests} />
            )}

            {/* ASSIGNED RIDER */}
            {req.assignedRider && (
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-sm font-semibold text-indigo-400">
                  Assigned Rider
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
