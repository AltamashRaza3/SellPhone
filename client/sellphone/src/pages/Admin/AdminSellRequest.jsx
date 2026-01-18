import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { auth } from "../utils/firebase";

const statusStyles = {
  Pending: "bg-yellow-500/20 text-yellow-400",
  "In Review": "bg-blue-500/20 text-blue-400",
  Approved: "bg-green-500/20 text-green-400",
  Rejected: "bg-red-500/20 text-red-400",
};

const AdminSellRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRequests = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

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

  if (loading) {
    return <p className="text-gray-400">Loading sell requests…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Sell Requests</h1>

      {requests.length === 0 ? (
        <p className="text-gray-400">No sell requests found.</p>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => {
            const phone = req.phone || {};
            const images = Array.isArray(phone.images) ? phone.images : [];
            const contactPhone = req.contact?.phone;
            const contactEmail = req.contact?.email || req.user?.email;

            return (
              <div key={req._id} className="glass-card space-y-4">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white text-lg">
                      {phone.brand} {phone.model}
                    </p>
                    <p className="text-sm text-gray-400">
                      {phone.storage || "—"} • {phone.ram || "—"} •{" "}
                      {phone.color || "—"} • {phone.condition}
                    </p>
                    <p className="mt-1 text-orange-400 font-semibold">
                      Expected ₹{req.expectedPrice}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[req.status]}`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* SELLER CONTACT */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Seller Contact
                  </p>

                  <p className="text-sm text-white">
                    <span className="text-gray-400">Email:</span> {contactEmail}
                  </p>

                  <p className="text-sm">
                    <span className="text-gray-400">WhatsApp:</span>{" "}
                    {contactPhone ? (
                      <a
                        href={`https://wa.me/91${contactPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 underline"
                      >
                        +91 {contactPhone}
                      </a>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </p>
                </div>

                {/* IMAGE PREVIEW GRID */}
                {images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">
                      Phone Images
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {images.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group"
                        >
                          <img
                            src={url}
                            alt={`Phone ${idx + 1}`}
                            className="h-32 w-full object-cover rounded-lg border border-white/10
                                       group-hover:scale-[1.02] transition"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* ADMIN ACTIONS */}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSellRequests;
