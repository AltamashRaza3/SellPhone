import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AssignRider from "../../components/Admin/AssignRider";

const AdminSellPhones = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="text-gray-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Sell Requests</h1>

      {requests.map((req) => {
        const phone = req.phone || {};
        const address = req.pickup?.address;
        const canAssignRider = req.pickup?.status === "Pending";

        return (
          <div key={req._id} className="glass-card space-y-4">
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {phone.brand} {phone.model}
                </h3>
                <p className="text-sm text-gray-400">
                  {phone.storage} • {phone.condition}
                </p>
                <p className="mt-1 text-orange-400 font-semibold">
                  Base Price ₹{req.pricing?.basePrice?.toLocaleString("en-IN")}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">
                {req.pickup?.status}
              </span>
            </div>

            {/* IMAGES */}
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

            {/* ASSIGN RIDER */}
            {canAssignRider && !req.assignedRider && (
              <AssignRider requestId={req._id} onAssigned={fetchRequests} />
            )}

            {/* ASSIGNED RIDER */}
            {req.assignedRider && (
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-sm font-semibold text-indigo-400">
                  Pickup Assigned
                </p>
                <p className="text-white">{req.assignedRider.name}</p>
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
