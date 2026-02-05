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

    // 🔐 LOGIN REQUIRED ONLY HERE
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
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
          <img
            src="/assets/empty-cart.png"
            alt="Empty Cart"
            className="w-40 h-40 opacity-80"
          />
          <h2 className="text-3xl font-bold">Your cart is empty</h2>
          <p className="text-gray-400">
            Looks like you haven’t added anything yet.
          </p>
          <Link to="/" className="btn-primary mt-4">
            Browse Phones
          </Link>
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <div className="space-y-8">
        {/* ================= HEADER ================= */}
        <div className="glass-card text-center">
          <h1 className="text-3xl font-bold text-white">Your Cart</h1>
          <p className="text-gray-400 mt-2">
            Review your selected phones before checkout
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ================= CART ITEMS ================= */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              return (
                <div
                  key={item.phone._id}
                  className="glass-card flex gap-6 items-center"
                >
                  <img
                    src={resolveImageUrl(item.phone.images?.[0])}
                    alt={`${item.phone.brand} ${item.phone.model}`}
                    className="w-28 h-28 object-contain rounded-xl bg-black/20 border border-white/10"
                    onError={(e) => (e.currentTarget.src = noImage)}
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {item.phone.brand} {item.phone.model}
                    </h3>

                    <p className="text-sm text-gray-400 mt-1">
                      Storage: {item.phone.storage} · Condition:{" "}
                      {item.phone.condition}
                    </p>

                    <p className="text-lg font-bold text-white mt-2">
                      ₹{item.phone.price.toLocaleString("en-IN")}
                    </p>

                    {/* ================= QUANTITY ================= */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              id: item.phone._id,
                              quantity: Math.max(1, item.quantity - 1),
                            }),
                          )
                        }
                        className="px-3 py-1 border border-white/20 rounded hover:bg-white/10"
                      >
                        −
                      </button>

                      <span className="font-medium">{item.quantity}</span>

                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              id: item.phone._id,
                              quantity: item.quantity + 1,
                            }),
                          )
                        }
                        className="px-3 py-1 border border-white/20 rounded hover:bg-white/10"
                      >
                        +
                      </button>

                      <button
                        onClick={() => dispatch(removeFromCart(item.phone._id))}
                        className="ml-auto text-sm text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= PRICE SUMMARY ================= */}
          <div className="glass-card sticky top-24 h-fit space-y-4">
            <h3 className="text-xl font-semibold text-white">Price Details</h3>

            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between text-gray-400">
              <span>Platform Fee</span>
              <span className="text-green-400">FREE</span>
            </div>

            <hr className="border-white/10" />

            <div className="flex justify-between text-lg font-bold text-white">
              <span>Total</span>
              <span>₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>

            <button onClick={handleCheckout} className="btn-primary w-full">
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate("/sale")}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium"
            >
              Sell Your Phone
            </button>

            <button
              onClick={() => dispatch(clearCart())}
              className="w-full text-sm text-red-400 hover:underline"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* ================= SUGGESTED ================= */}
        {suggestedPhones.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">You may also like</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {suggestedPhones.map((phone) => {
                return (
                  <Link
                    to={`/phone/${phone._id}`}
                    key={phone._id}
                    className="glass-card flex flex-col items-center hover:scale-[1.02] transition"
                  >
                    <img
                      src={resolveImageUrl(phone.images?.[0])}
                      alt={`${phone.brand} ${phone.model}`}
                      className="h-28 object-contain mb-3"
                      onError={(e) => (e.currentTarget.src = noImage)}
                    />

                    <h4 className="font-semibold text-sm text-center">
                      {phone.brand} {phone.model}
                    </h4>
                    <p className="text-orange-400 font-bold mt-1">
                      ₹{phone.price.toLocaleString("en-IN")}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppContainer>
  );
};

export default Cart;
