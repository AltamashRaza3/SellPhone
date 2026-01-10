import { useDispatch, useSelector } from "react-redux";
import { updateSellStatus } from "../../redux/slices/adminSellSlice";

const AdminSellPhone = () => {
  const dispatch = useDispatch();
  const requests = useSelector((state) => state.adminSell.requests);

  if (requests.length === 0) {
    return <p className="text-gray-400">No sell requests</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Sell Requests</h1>

      {requests.map((req) => (
        <div
          key={req.id}
          className="bg-black/40 border border-white/10 rounded-xl p-6 shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {req.brand} {req.model}
              </h3>
              <p className="text-sm text-gray-400">
                {req.storage} • {req.condition}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Seller: {req.user.name} ({req.user.email})
              </p>
              <p className="mt-2 text-orange-400 font-semibold">
                Expected: ₹{req.priceExpected}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold
              ${
                req.status === "pending"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : req.status === "approved"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {req.status.toUpperCase()}
            </span>
          </div>

          {req.status === "pending" && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() =>
                  dispatch(updateSellStatus({ id: req.id, status: "approved" }))
                }
                className="px-4 py-2 rounded-lg bg-green-600/30 text-green-400 hover:bg-green-600/50"
              >
                Approve
              </button>

              <button
                onClick={() =>
                  dispatch(updateSellStatus({ id: req.id, status: "rejected" }))
                }
                className="px-4 py-2 rounded-lg bg-red-600/30 text-red-400 hover:bg-red-600/50"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminSellPhone;
