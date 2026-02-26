import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AssignRider from "../../components/Admin/AssignRider";

/* ======================================================
   STATUS BADGE MAPPING
====================================================== */
const getDisplayStatus = (req) => {
  const map = {
    CREATED: { label: "Pending Review", color: "bg-gray-500/20 text-gray-300" },
    ADMIN_APPROVED: {
      label: "Approved",
      color: "bg-yellow-500/20 text-yellow-400",
    },
    ASSIGNED_TO_RIDER: {
      label: "Pickup Scheduled",
      color: "bg-blue-500/20 text-blue-400",
    },
    UNDER_VERIFICATION: {
      label: "Under Verification",
      color: "bg-indigo-500/20 text-indigo-400",
    },
    REJECTED_BY_RIDER: {
      label: "Rejected by Rider",
      color: "bg-red-600/20 text-red-400",
    },
    USER_ACCEPTED: {
      label: "User Accepted",
      color: "bg-green-500/20 text-green-400",
    },
    COMPLETED: {
      label: "Pickup Completed",
      color: "bg-green-600/20 text-green-400",
    },
    CANCELLED: { label: "Cancelled", color: "bg-red-500/20 text-red-400" },
  };

  return (
    map[req.workflowStatus] || {
      label: "Unknown",
      color: "bg-gray-600/20 text-gray-400",
    }
  );
};

const AdminSellPhones = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [transactionRefs, setTransactionRefs] = useState({});
  const [processingPayoutId, setProcessingPayoutId] = useState(null);
  const [filter, setFilter] = useState("ALL"); // ALL | UNPAID | PAID

  /* ======================================================
     FETCH REQUESTS
  ====================================================== */
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/sell-requests`,
        { credentials: "include" },
      );

      if (!res.ok) throw new Error("Failed to fetch sell requests");

      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load sell requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* ======================================================
     ADMIN APPROVE / REJECT
  ====================================================== */
  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/sell-requests/${id}/status`,
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

  /* ======================================================
     MARK SELLER AS PAID
  ====================================================== */
  const markAsPaid = async (id) => {
    try {
      const ref = transactionRefs[id];

      if (!ref?.trim()) {
        toast.error("Enter transaction reference / UTR");
        return;
      }

      setProcessingPayoutId(id);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/sell-requests/${id}/payout`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ transactionReference: ref.trim() }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Seller marked as paid successfully");
      fetchRequests();
    } catch (err) {
      toast.error(err.message || "Payout failed");
    } finally {
      setProcessingPayoutId(null);
    }
  };

  /* ======================================================
     FINANCIAL SUMMARY
  ====================================================== */
  const completed = requests.filter((r) => r.workflowStatus === "COMPLETED");
  const unpaid = completed.filter((r) => r.payout?.status !== "Paid");
  const paid = completed.filter((r) => r.payout?.status === "Paid");

  const totalUnpaid = unpaid.reduce(
    (sum, r) => sum + (r.verification?.finalPrice || 0),
    0,
  );

  const totalPaid = paid.reduce(
    (sum, r) => sum + (r.verification?.finalPrice || 0),
    0,
  );

  if (loading) return <p className="text-gray-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Sell Requests</h1>

      {/* ================= FINANCIAL SUMMARY ================= */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
        <div className="flex flex-wrap gap-6 text-sm text-gray-300">
          <p>
            Completed Orders:
            <span className="ml-2 text-white font-semibold">
              {completed.length}
            </span>
          </p>

          <p>
            Pending Payout:
            <span className="ml-2 text-yellow-400 font-semibold">
              ₹{totalUnpaid.toLocaleString("en-IN")}
            </span>
          </p>

          <p>
            Total Paid:
            <span className="ml-2 text-green-400 font-semibold">
              ₹{totalPaid.toLocaleString("en-IN")}
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          {["ALL", "UNPAID", "PAID"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1 rounded-lg text-xs font-semibold ${
                filter === type
                  ? "bg-white text-black"
                  : "bg-black/40 text-gray-300 border border-white/10"
              }`}
            >
              {type === "ALL"
                ? "All"
                : type === "UNPAID"
                  ? "Unpaid Only"
                  : "Paid Only"}
            </button>
          ))}
        </div>
      </div>

      {/* ================= REQUEST LIST ================= */}
      <div className="space-y-12">
  {requests
    .filter((req) => {
      if (filter === "UNPAID")
        return (
          req.workflowStatus === "COMPLETED" &&
          req.payout?.status !== "Paid"
        );

      if (filter === "PAID")
        return (
          req.workflowStatus === "COMPLETED" &&
          req.payout?.status === "Paid"
        );

      return true;
    })

        .map((req) => {
          const phone = req.phone || {};
          const address = req.pickup?.address || {};
          const status = getDisplayStatus(req);
          const rejectionEntry = [...(req.statusHistory || [])]
            .reverse()
            .find((entry) => entry.status === "Pickup Rejected");

          const rejectionReason = rejectionEntry?.note;
          const canApproveReject = req.workflowStatus === "CREATED";
          const canAssignRider =
            req.workflowStatus === "ADMIN_APPROVED" ||
            req.workflowStatus === "ASSIGNED_TO_RIDER";

          const isLocked =
            req.workflowStatus === "UNDER_VERIFICATION" ||
            req.workflowStatus === "USER_ACCEPTED" ||
            req.workflowStatus === "COMPLETED" ||
            req.workflowStatus === "CANCELLED";

          return (
            <div
              key={req._id}
              className="glass-card p-6 space-y-6 rounded-xl bg-black/30 border border-white/10 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* ================= HEADER ================= */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">
                    {phone.brand} {phone.model}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {phone.storage} • {phone.declaredCondition}
                  </p>

                  <p className="text-orange-400 font-semibold text-sm">
                    Base Price AED: 
                    {req.pricing?.basePrice?.toLocaleString("en-IN")}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center justify-center px-3 h-7 rounded-full text-xs font-semibold ${status.color}`}
                >
                  {status.label}
                </span>
              </div>

              {/* ================= REJECTION DETAILS ================= */}
              {req.workflowStatus === "REJECTED_BY_RIDER" && (
                <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-red-400">
                    Rejection Details
                  </p>

                  <p className="text-sm text-red-300">
                    <span className="font-medium">Reason:</span>{" "}
                    {rejectionReason || "No reason provided"}
                  </p>

                  {rejectionEntry?.changedAt && (
                    <p className="text-xs text-red-500">
                      <span className="font-medium">Rejected At:</span>{" "}
                      {new Date(rejectionEntry.changedAt).toLocaleString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* ================= SELLER INFO ================= */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 space-y-1">
                <p>Email: {req.user?.email}</p>
                <p>Phone: {req.contact?.phone}</p>
              </div>

              {/* ================= ADDRESS ================= */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 space-y-1">
                <p>{address.line1}</p>
                <p>
                  {address.city}, {address.state} – {address.pincode}
                </p>
              </div>

              {/* ================= APPROVAL ================= */}
              {canApproveReject && (
                <div className="space-y-4">
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

              {/* ================= ASSIGN RIDER ================= */}
              {canAssignRider && !isLocked && (
                <AssignRider
                  requestId={req._id}
                  alreadyAssigned={Boolean(req.assignedRider?.riderId)}
                  onAssigned={fetchRequests}
                />
              )}

              {/* ================= BANK & PAYOUT ================= */}
              {req.workflowStatus === "COMPLETED" && (
                <div className="p-5 bg-green-500/5 border border-green-500/20 rounded-xl space-y-4">
                  <p className="text-sm font-semibold text-green-400">
                    Seller Bank Details
                  </p>

                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Name: {req.bankDetails?.accountHolderName}</p>
                    <p>Account: {req.bankDetails?.accountNumber}</p>
                    <p>IFSC: {req.bankDetails?.ifscCode}</p>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <p className="text-sm font-semibold text-white">
                      Final Price ₹
                      {req.verification?.finalPrice?.toLocaleString("en-IN")}
                    </p>

                    <p className="text-m text-orange-400">
                      Status:{" "}
                      <span
                        className={`font-semibold ${
                          req.payout?.status === "Paid"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {req.payout?.status || "Pending"}
                      </span>
                    </p>

                    {req.payout?.status === "Paid" ? (
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>Ref: {req.payout.transactionReference}</p>
                        <p>
                          Paid At:{" "}
                          {new Date(req.payout.paidAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Transaction Reference / UTR"
                          value={transactionRefs[req._id] || ""}
                          onChange={(e) =>
                            setTransactionRefs({
                              ...transactionRefs,
                              [req._id]: e.target.value,
                            })
                          }
                          className="w-full rounded-lg bg-black/40 border border-white/10 p-2 text-sm text-white"
                        />

                        <button
                          disabled={processingPayoutId === req._id}
                          onClick={() => markAsPaid(req._id)}
                          className="w-full h-9 rounded-lg bg-green-600 text-white text-sm font-semibold"
                        >
                          Mark as Paid
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSellPhones;
