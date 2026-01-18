import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { auth } from "../../utils/firebase";

const statusStyles = {
  Pending: "bg-yellow-500/20 text-yellow-400",
  "In Review": "bg-blue-500/20 text-blue-400",
  Approved: "bg-green-500/20 text-green-400",
  Rejected: "bg-red-500/20 text-red-400",
};

const AdminSellPhones = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  /* ================= FETCH ALL SELL REQUESTS ================= */
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();

      const res = await fetch("http://localhost:5000/api/admin/sell-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (id, status, adminNotes) => {
    try {
      setUpdatingId(id);
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(
        `http://localhost:5000/api/admin/sell-requests/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ status, adminNotes }),
        },
      );

      if (!res.ok) throw new Error();
      toast.success("Status updated");
      fetchRequests();
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return <p className="text-gray-400">Loading sell requests…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Sell Phone Requests</h1>

      {requests.length === 0 ? (
        <p className="text-gray-400">No sell requests found.</p>
      ) : (
        <div className="space-y-5">
          {requests.map((req) => (
            <div key={req._id} className="glass-card space-y-4">
              {/* ================= HEADER ================= */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {req.phone.brand} {req.phone.model}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {req.phone.storage || "—"} • {req.phone.ram || "—"} •{" "}
                    {req.phone.color || "—"}
                  </p>
                  <p className="mt-1 text-orange-400 font-semibold">
                    Expected ₹{req.expectedPrice}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[req.status]}`}
                >
                  {req.status}
                </span>
              </div>

              {/* ================= SELLER CONTACT ================= */}
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Seller Contact</p>
                <p className="text-sm text-white">
                  Email: {req.user?.email || "N/A"}
                </p>
                <p className="text-sm">
                  Phone:{" "}
                  {req.contact?.phone ? (
                    <a
                      href={`https://wa.me/91${req.contact.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 underline"
                    >
                      +91 {req.contact.phone}
                    </a>
                  ) : (
                    <span className="text-white">N/A</span>
                  )}
                </p>
              </div>

              {/* ================= IMAGES ================= */}
              {req.phone.images?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Submitted Images</p>
                  <div className="flex flex-wrap gap-2">
                    {req.phone.images.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline text-sm"
                      >
                        Image {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* PICKUP ADDRESS */}
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm font-semibold text-gray-400 mb-2">
                  Pickup Address
                </p>

                <p className="text-sm text-white">
                  {req.pickupAddress?.fullAddress}
                </p>

                <p className="text-sm text-gray-300 mt-1">
                  {req.pickupAddress?.city}, {req.pickupAddress?.state} -{" "}
                  {req.pickupAddress?.pincode}
                </p>

                {req.pickupAddress?.landmark && (
                  <p className="text-xs text-gray-400 mt-1">
                    Landmark: {req.pickupAddress.landmark}
                  </p>
                )}
              </div>

              {/* ================= ADMIN ACTIONS ================= */}
              <div className="grid md:grid-cols-4 gap-3">
                <select
                  className="input"
                  defaultValue={req.status}
                  disabled={updatingId === req._id}
                  onChange={(e) =>
                    updateStatus(req._id, e.target.value, req.adminNotes)
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <input
                  type="text"
                  placeholder="Admin notes"
                  defaultValue={req.adminNotes || ""}
                  className="input md:col-span-3"
                  onBlur={(e) =>
                    updateStatus(req._id, req.status, e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSellPhones;
