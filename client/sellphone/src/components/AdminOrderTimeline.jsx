const steps = ["Pending", "Processing", "Shipped", "Delivered"];

const AdminOrderTimeline = ({ order }) => {
  if (!order) return null;

  if (order.status === "Cancelled") {
    return <div className="text-red-400 font-semibold">❌ Order Cancelled</div>;
  }

  const currentIndex = steps.indexOf(order.status);

  return (
    <div className="flex items-center gap-4">
      {steps.map((step, idx) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              idx <= currentIndex ? "bg-green-500" : "bg-gray-600"
            }`}
          />
          <span
            className={`text-xs ${
              idx <= currentIndex ? "text-green-400" : "text-gray-400"
            }`}
          >
            {step}
          </span>
          {idx < steps.length - 1 && <div className="w-10 h-px bg-gray-600" />}
        </div>
      ))}
    </div>
  );
};

export default AdminOrderTimeline;
