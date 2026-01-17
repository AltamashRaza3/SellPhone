const STATUS_MAP = {
  Pending: "bg-yellow-500/15 text-yellow-400",
  Processing: "bg-blue-500/15 text-blue-400",
  Shipped: "bg-purple-500/15 text-purple-400",
  Delivered: "bg-green-500/15 text-green-400",
  Cancelled: "bg-red-500/15 text-red-400",
};

const OrderStatusBadge = ({ status }) => {
  const cls = STATUS_MAP[status] || "bg-gray-500/15 text-gray-400";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
};

export default OrderStatusBadge;
