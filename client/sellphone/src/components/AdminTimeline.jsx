import { ORDER_STEPS, CANCELLED_STATUS } from "../constants/orderStatus";

const AdminOrderTimeline = ({ status }) => {
  if (status === CANCELLED_STATUS) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
        <p className="text-red-400 font-semibold">Order Cancelled by User</p>
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.findIndex((step) => step.key === status);

  return (
    <div className="grid grid-cols-4 gap-4">
      {ORDER_STEPS.map((step, index) => (
        <div
          key={step.key}
          className={`p-3 rounded-lg text-center border ${
            index <= currentIndex
              ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
              : "bg-white/5 border-white/10 text-gray-400"
          }`}
        >
          <p className="text-xs font-medium">{step.label}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminOrderTimeline;
