import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { auth } from "../utils/firebase";
import { Link } from "react-router-dom";

const statusStyles = {
  Pending: "bg-yellow-500/20 text-yellow-400",
  "In Review": "bg-blue-500/20 text-blue-400",
  Approved: "bg-green-500/20 text-green-400",
  Rejected: "bg-red-500/20 text-red-400",
};

const statusText = {
  Pending: "Waiting for admin review",
  "In Review": "Your phone is being verified",
  Approved: "Approved! We’ll contact you shortly",
  Rejected: "Request rejected",
};

const MySellRequests = () => {
  const { user, authLoaded } = useSelector((state) => state.user);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoaded || !user) return;

    const fetchRequests = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch("http://localhost:5000/api/sell-requests/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();
        setRequests(await res.json());
      } catch {
        toast.error("Failed to load your sell requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [authLoaded, user]);

  if (loading) {
    return (
      <div className="appContainer py-12 text-gray-400">
        Loading your sell requests…
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="appContainer py-12 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">
          No sell requests yet
        </h2>
        <p className="text-gray-400 mb-4">
          Sell your phone in just a few steps
        </p>
        <Link to="/sale" className="btn-primary px-6 py-3">
          Sell Your Phone
        </Link>
      </div>
    );
  }

  return (
    <div className="appContainer py-12 space-y-6">
      <h1 className="text-2xl font-bold text-white">My Sell Requests</h1>

      {requests.map((req) => (
        <div key={req._id} className="glass-card space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {req.phone.brand} {req.phone.model}
              </h3>
              <p className="text-sm text-gray-400">
                {req.phone.storage || "—"} • {req.phone.condition}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[req.status]}`}
            >
              {req.status}
            </span>
          </div>

          {/* Price */}
          <p className="text-orange-400 font-semibold">
            Expected Price: ₹{req.expectedPrice}
          </p>

          {/* Status Info */}
          <p className="text-sm text-gray-300">{statusText[req.status]}</p>

          {/* Admin Note */}
          {req.adminNotes && (
            <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-sm">
              <span className="text-gray-400">Admin note:</span>{" "}
              <span className="text-white">{req.adminNotes}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-wrap gap-3">
            {req.status === "Approved" && req.contact?.phone && (
              <a
                href={`https://wa.me/91${req.contact.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/40"
              >
                Contact on WhatsApp
              </a>
            )}

            {req.status === "Rejected" && (
              <Link
                to="/sale"
                className="px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/40"
              >
                Sell Again
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MySellRequests;
