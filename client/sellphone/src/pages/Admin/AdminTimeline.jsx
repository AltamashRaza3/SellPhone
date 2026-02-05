import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import API_BASE_URL from "../../config/api";

const AdminTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${API_BASE_URL}/api/admin/sell-requests/${id}/timeline`,
      {
        credentials: "include",
      },
    )
      .then((res) => res.json())
      .then((data) => setTimeline(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-400">Loading timeline...</div>;
  }

  if (!timeline) {
    return <div className="p-6 text-red-400">Timeline not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-white">Pickup Timeline</h1>
      </div>

      {/* Rider Info */}
      {timeline.assignedRider && (
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Assigned Rider</p>
          <p className="font-semibold text-white">
            {timeline.assignedRider.name} — {timeline.assignedRider.phone}
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {timeline.history.length === 0 && (
          <p className="text-gray-400">No timeline events</p>
        )}

        {timeline.history.map((item, index) => (
          <div
            key={index}
            className="bg-gray-900 border border-gray-700 rounded-xl p-4"
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-indigo-400">{item.action}</p>
              <p className="text-xs text-gray-500">
                {new Date(item.at).toLocaleString()}
              </p>
            </div>

            <p className="text-sm text-gray-300 mt-1">{item.note}</p>

            <p className="text-xs text-gray-500 mt-1">By: {item.by}</p>
          </div>
        ))}
      </div>

      {/* Uploaded Images */}
      {timeline.verification?.images?.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">Pickup Images</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {timeline.verification.images.map((img, idx) => (
              <img
                key={idx}
                src={`${API_BASE_URL}${img}`}
                alt="Pickup"
                className="rounded-xl border border-gray-700"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTimeline;
