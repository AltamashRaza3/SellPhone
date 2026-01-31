import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CartPreview = () => {
  const cart = useSelector((state) => state.cart.items);
  const navigate = useNavigate();

  return (
    <div className="fixed top-16 right-4 bg-white shadow-lg rounded-lg p-4 w-64 z-50">
      <h2 className="font-bold text-lg mb-2">Cart ({cart.length})</h2>

      {cart.length === 0 && (
        <p className="text-gray-500 text-sm">No items in cart</p>
      )}

      {cart.map((item) => (
        <div key={item.phone._id} className="flex justify-between text-sm mb-1">
          <span className="truncate">
            {item.phone.brand} {item.phone.model}
          </span>
          <span>x {item.quantity}</span>
        </div>
      ))}

      {/* ✅ ONLY GO TO CART */}
      <button
        onClick={() => navigate("/cart")}
        className="mt-3 w-full bg-orange-500 text-white py-2 rounded-lg font-medium"
      >
        View Cart
      </button>
    </div>
  );
};

export default CartPreview;
