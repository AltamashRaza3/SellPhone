const ORDER_STEPS = [
  { key: "Pending", label: "Order Placed" },
  { key: "Processing", label: "Processing" },
  { key: "Shipped", label: "Shipped" },
  { key: "Delivered", label: "Delivered" },
];

const OrderTimeline = ({ status }) => {
  /* ================= CANCELLED ================= */
  if (status === "Cancelled") {
    return (
      <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
        <p className="text-red-400 font-semibold text-sm">❌ Order Cancelled</p>
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.findIndex((step) => step.key === status);

  return (
    <div className="mt-6 flex items-center justify-between">
      {ORDER_STEPS.map((step, index) => {
        const completed = index <= currentIndex;

        return (
          <div key={step.key} className="flex-1 text-center">
            {/* DOT */}
            <div
              className={`mx-auto w-3 h-3 rounded-full ${
                completed ? "bg-green-500" : "bg-gray-600"
              }`}
            />

            {/* LABEL */}
            <p
              className={`mt-2 text-xs ${
                completed ? "text-green-400" : "text-gray-400"
              }`}
            >
              {step.label}
            </p>

            {/* LINE */}
            {index < ORDER_STEPS.length - 1 && (
              <div
                className={`mx-auto mt-2 h-px w-8 ${
                  completed ? "bg-green-500" : "bg-gray-600"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
