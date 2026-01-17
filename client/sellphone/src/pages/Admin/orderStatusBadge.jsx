
const STATUS_STYLES = {
  Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  Cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const OrderStatusBadge = ({ status }) => {
  if (!status) return null;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
        STATUS_STYLES[status] ||
        "bg-gray-500/20 text-gray-400 border-gray-500/30"
      }`}
    >
      {status}
    </span>
  );
};

export default OrderStatusBadge;
