const AdminOrderStatusHistory = ({ history = [] }) => {
  if (!history.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Status History</h2>

      <div className="space-y-3">
        {history.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center text-sm text-gray-300 border-b border-white/10 pb-2"
          >
            <span className="font-medium text-white">{item.status}</span>

            <div className="text-right text-gray-400">
              <p className="capitalize">{item.changedBy}</p>
              <p className="text-xs">
                {new Date(item.changedAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrderStatusHistory;
