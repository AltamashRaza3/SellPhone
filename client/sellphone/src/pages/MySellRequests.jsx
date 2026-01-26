import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const statusLabel = (req) => {
  if (req.finalStatus === "Closed") return "Closed";
  if (req.pickup?.status === "Completed") return "Pickup Completed";
  if (req.pickup?.status === "Picked") return "Device Picked";
  if (req.pickup?.status === "Scheduled") return "Pickup Scheduled";
  if (req.adminStatus === "Approved" && req.finalPrice)
    return "Final Price Offered";
  return "Under Review";
};

const badgeColor = {
  Closed: "bg-red-500/20 text-red-400",
  "Pickup Completed": "bg-green-600/20 text-green-400",
  "Pickup Scheduled": "bg-blue-500/20 text-blue-400",
  "Final Price Offered": "bg-orange-500/20 text-orange-400",
  "Under Review": "bg-gray-500/20 text-gray-300",
};

const MySellRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/sell-requests/my", {
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

  if (loading) {
    return <div className="appContainer py-12">Loading…</div>;
  }

  if (!requests.length) {
    return (
      <div className="appContainer py-12 text-center">
        <h2 className="text-xl font-semibold">No sell requests yet</h2>
        <Link to="/sale" className="btn-primary mt-4 inline-block">
          Sell Your Phone
        </Link>
      </div>
    );
  }

  return (
    <div className="appContainer py-12 space-y-6">
      <h1 className="text-2xl font-bold">My Sell Requests</h1>

      {requests.map((req) => {
        const label = statusLabel(req);

        return (
          <div key={req._id} className="glass-card space-y-3">
            <h3 className="text-lg font-semibold">
              {req.phone.brand} {req.phone.model}
            </h3>

            <p className="text-sm text-gray-400">
              {req.phone.storage} • {req.phone.condition}
            </p>

            <p className="text-orange-400">
              Expected Price: ₹{req.expectedPrice}
            </p>

            {req.finalPrice && (
              <p className="text-green-400 font-semibold">
                Final Price: ₹{req.finalPrice}
              </p>
            )}

            {/* STATUS */}
            <span
              className={`inline-block px-3 py-1 rounded text-sm ${badgeColor[label]}`}
            >
              {label}
            </span>

            {/* RIDER INFO – ONLY IF ACTIVE */}
            {req.assignedRider && req.pickup?.status !== "Completed" && (
              <div className="mt-2 text-sm text-gray-300">
                <p>Rider: {req.assignedRider.name}</p>
                <p>Phone: {req.assignedRider.phone}</p>
              </div>
            )}

            {/* FINAL MESSAGE */}
            {req.finalStatus === "Closed" && (
              <p className="text-sm text-gray-400">
                This request has been closed.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MySellRequests;
