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
      <div className="mt-6 p-5 rounded-2xl bg-red-50 border border-red-100 text-center">
        <p className="text-red-600 text-sm font-medium">Order Cancelled</p>
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.findIndex((step) => step.key === status);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between relative">
        {ORDER_STEPS.map((step, index) => {
          const completed = index <= currentIndex;

          return (
            <div
              key={step.key}
              className="flex-1 flex flex-col items-center relative"
            >
              {/* CONNECTOR LINE */}
              {index !== 0 && (
                <div
                  className={`absolute left-0 top-4 w-full h-px ${
                    index <= currentIndex ? "bg-gray-900" : "bg-gray-200"
                  }`}
                  style={{ transform: "translateX(-50%)" }}
                />
              )}

              {/* DOT */}
              <div
                className={`relative z-10 w-4 h-4 rounded-full border-2 transition-all ${
                  completed
                    ? "bg-black border-black"
                    : "bg-white border-gray-300"
                }`}
              />

              {/* LABEL */}
              <p
                className={`mt-3 text-xs font-medium tracking-wide ${
                  completed ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
