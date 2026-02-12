import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CartPreview = () => {
  const cart = useSelector((state) => state.cart.items);
  const navigate = useNavigate();

  return (
    <div className="fixed top-20 right-6 w-80 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 z-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-semibold tracking-wide text-gray-900">
          Cart
        </h2>
        <span className="text-xs text-gray-400">{cart.length} items</span>
      </div>

      {/* Items */}
      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">Your cart is empty.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
          {cart.map((item) => (
            <div
              key={item.phone._id}
              className="flex justify-between items-start text-sm"
            >
              <div className="flex-1">
                <p className="text-gray-900 font-medium leading-tight">
                  {item.phone.brand} {item.phone.model}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Qty {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Button */}
      <button
        onClick={() => navigate("/cart")}
        className="mt-6 w-full py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-90 transition"
      >
        View Cart
      </button>
    </div>
  );
};

export default CartPreview;
