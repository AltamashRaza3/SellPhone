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
import AppContainer from "../components/AppContainer";
import noImage from "../assets/no-image.png";
import { resolveImageUrl } from "../utils/resolveImageUrl";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems);
  const totalAmount = useSelector(selectCartTotal);
  const suggestedPhones = useSelector(selectSuggestedPhones);
  const user = useSelector((state) => state.user.user);

  /* ================= CHECKOUT ================= */
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!user) {
      navigate("/auth?redirect=/checkout");
      return;
    }

    navigate("/checkout");
  };

  /* ================= EMPTY CART ================= */
  if (cartItems.length === 0) {
    return (
      <AppContainer>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
            🛒
          </div>

          <h2 className="text-3xl font-semibold text-gray-900">
            Your cart is empty
          </h2>

          <p className="text-gray-500 max-w-md">
            Looks like you haven’t added anything yet. Start exploring premium
            refurbished devices.
          </p>

          <Link
            to="/phones"
            className="px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-90 transition"
          >
            Browse Phones
          </Link>
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 space-y-16">
        {/* ================= HEADER ================= */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
            Your Cart
          </h1>
          <p className="text-gray-500">
            Review your selected devices before checkout.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-14">
          {/* ================= CART ITEMS ================= */}
          <div className="lg:col-span-2 space-y-8">
            {cartItems.map((item) => (
              <div
                key={item.phone._id}
                className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col md:flex-row gap-8 transition hover:shadow-sm"
              >
                {/* IMAGE */}
                <div className="flex items-center justify-center bg-gray-50 rounded-2xl p-6 w-full md:w-48">
                  <img
                    src={resolveImageUrl(item.phone.images?.[0])}
                    alt={`${item.phone.brand} ${item.phone.model}`}
                    className="h-28 object-contain"
                    onError={(e) => (e.currentTarget.src = noImage)}
                  />
                </div>

                {/* INFO */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.phone.brand} {item.phone.model}
                    </h3>

                    <p className="text-sm text-gray-500 mt-2">
                      {item.phone.storage} · {item.phone.condition}
                    </p>

                    <p className="text-xl font-semibold text-gray-900 mt-6">
                      ₹{item.phone.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* QUANTITY */}
                  <div className="flex items-center gap-6 mt-6">
                    <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              id: item.phone._id,
                              quantity: Math.max(1, item.quantity - 1),
                            }),
                          )
                        }
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition"
                      >
                        −
                      </button>

                      <span className="px-5 text-gray-900 font-medium">
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
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => dispatch(removeFromCart(item.phone._id))}
                      className="text-sm text-gray-400 hover:text-red-500 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="bg-white rounded-3xl border border-gray-100 p-10 space-y-8 h-fit sticky top-28">
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

            <div className="border-t border-gray-100 pt-6 flex justify-between text-lg font-semibold text-gray-900">
              <span>Total</span>
              <span>₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-4 rounded-full bg-black text-white text-base font-medium hover:opacity-90 transition"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => dispatch(clearCart())}
              className="w-full text-sm text-gray-400 hover:text-red-500 transition"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* ================= SUGGESTED ================= */}
        {suggestedPhones.length > 0 && (
          <div className="space-y-10">
            <h2 className="text-2xl font-semibold text-gray-900 text-center">
              You May Also Like
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {suggestedPhones.map((phone) => (
                <Link
                  to={`/phone/${phone._id}`}
                  key={phone._id}
                  className="bg-white rounded-3xl border border-gray-100 p-6 text-center transition hover:shadow-sm"
                >
                  <img
                    src={resolveImageUrl(phone.images?.[0])}
                    alt={`${phone.brand} ${phone.model}`}
                    className="h-28 object-contain mx-auto mb-6"
                    onError={(e) => (e.currentTarget.src = noImage)}
                  />

                  <h4 className="text-sm font-medium text-gray-900">
                    {phone.brand} {phone.model}
                  </h4>

                  <p className="text-lg font-semibold text-gray-900 mt-3">
                    ₹{phone.price.toLocaleString("en-IN")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppContainer>
  );
};

export default Cart;
