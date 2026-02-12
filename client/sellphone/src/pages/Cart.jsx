import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../redux/slices/cartSlice";
import {
  selectCartItems,
  selectCartTotal,
  selectSuggestedPhones,
} from "../redux/slices/selectors/cartSelectors";
import { toast } from "react-hot-toast";
import noImage from "../assets/no-image.png";
import { resolveImageUrl } from "../utils/resolveImageUrl";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems);
  const totalAmount = useSelector(selectCartTotal);
  const suggestedPhones = useSelector(selectSuggestedPhones);
  const user = useSelector((state) => state.user.user);

  const handleCheckout = () => {
    if (!cartItems.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (!user) {
      navigate("/auth?redirect=/checkout");
      return;
    }

    navigate("/checkout");
  };

  if (!cartItems.length) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-[#f5f5f7] text-center space-y-8">
        <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center text-4xl">
          🛒
        </div>

        <h2 className="text-4xl font-semibold text-gray-900">
          Your cart is empty
        </h2>

        <p className="text-gray-500 max-w-md">
          Explore premium refurbished devices with verified quality and secure
          delivery.
        </p>

        <Link
          to="/phones"
          className="px-8 py-4 rounded-full bg-black text-white font-medium hover:scale-[1.03] transition"
        >
          Browse Phones
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-24">
      <div className="max-w-6xl 2xl:max-w-5xl mx-auto px-6 space-y-24">
        {/* HEADER */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
            Your Cart
          </h1>
          <p className="text-gray-500 text-lg">
            Secure checkout. Fast delivery across India.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-20 items-start">
          {/* ================= PRODUCTS ================= */}
          <div className="lg:col-span-2 space-y-14">
            {cartItems.map((item) => {
              const mrp = Math.round(item.phone.price * 1.15);

              return (
                <div
                  key={item.phone._id}
                  className="relative bg-white rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.06)] p-12 flex flex-col md:flex-row gap-12 transition hover:shadow-[0_40px_120px_rgba(0,0,0,0.08)]"
                >
                  {/* REMOVE (CLOSE STYLE) */}
                  <button
                    onClick={() => dispatch(removeFromCart(item.phone._id))}
                    className="absolute top-6 right-6 text-gray-300 hover:text-red-500 text-lg transition"
                  >
                    ×
                  </button>

                  {/* IMAGE */}
                  <div className="bg-[#fafafa] rounded-[32px] flex items-center justify-center p-12 w-full md:w-64">
                    <img
                      src={resolveImageUrl(item.phone.images?.[0])}
                      alt={`${item.phone.brand} ${item.phone.model}`}
                      className="h-36 object-contain"
                      onError={(e) => (e.currentTarget.src = noImage)}
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 flex flex-col justify-between space-y-8">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {item.phone.brand} {item.phone.model}
                      </h3>

                      <p className="text-gray-500 text-sm">
                        {item.phone.storage} • {item.phone.ram} •{" "}
                        {item.phone.color}
                      </p>

                      {/* PRICE BLOCK */}
                      <div className="flex items-center gap-4 pt-2">
                        <p className="text-2xl font-semibold text-gray-900">
                          ₹{item.phone.price.toLocaleString("en-IN")}
                        </p>

                        <p className="text-sm text-gray-400 line-through">
                          ₹{mrp.toLocaleString("en-IN")}
                        </p>

                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          15% OFF
                        </span>
                      </div>

                      {item.phone.stock <= 3 && (
                        <p className="text-xs text-red-500 pt-1">
                          Only {item.phone.stock} left in stock
                        </p>
                      )}
                    </div>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-6 pt-4">
                      <div className="flex items-center bg-gray-100 rounded-full px-5 py-2">
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                id: item.phone._id,
                                quantity: Math.max(1, item.quantity - 1),
                              }),
                            )
                          }
                          className="px-3 text-gray-600 hover:text-black"
                        >
                          −
                        </button>

                        <span className="px-5 font-medium">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                id: item.phone._id,
                                quantity: item.quantity + 1,
                              }),
                            )
                          }
                          className="px-3 text-gray-600 hover:text-black"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="bg-white rounded-[48px] shadow-[0_40px_120px_rgba(0,0,0,0.08)] p-12 space-y-8 sticky top-32">
            <h3 className="text-xl font-semibold text-gray-900">
              Order Summary
            </h3>

            <div className="space-y-4 text-gray-600 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="text-gray-900">Free</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 flex justify-between text-lg font-semibold text-gray-900">
              <span>Total</span>
              <span>₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-4 rounded-full bg-black text-white font-medium hover:scale-[1.02] transition"
            >
              Proceed to Checkout
            </button>

            <div className="text-gray-500 text-xs text-center space-y-1 pt-4">
              <p>🔒 100% Secure Payments</p>
              <p>🚚 Fast Delivery</p>
              <p>🛡 Warranty Included</p>
            </div>

            <button
              onClick={() => dispatch(clearCart())}
              className="w-full text-xs text-gray-400 hover:text-red-500 transition pt-6"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
