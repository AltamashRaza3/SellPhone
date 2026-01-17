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

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ================= MEMOIZED REDUX SELECTORS ================= */
  const cartItems = useSelector(selectCartItems);
  const totalAmount = useSelector(selectCartTotal);
  const suggestedPhones = useSelector(selectSuggestedPhones);

  /* ================= CHECKOUT ================= */
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  /* ================= EMPTY CART ================= */
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
        <img
          src="/assets/empty-cart.png"
          alt="Empty Cart"
          className="w-40 h-40 mx-auto"
        />
        <h2 className="text-3xl font-bold">Your cart is empty</h2>
        <p className="text-gray-500">
          Looks like you haven’t added anything yet.
        </p>
        <Link
          to="/"
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition"
        >
          Browse Phones
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="bg-orange-50 rounded-xl p-6 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-orange-600">Your Cart</h1>
        <p className="text-gray-600 mt-2">
          Review your selected phones before checkout
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* CART ITEMS */}
        <div className="md:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.phone._id}
              className="flex items-center gap-4 bg-white p-4 rounded-xl shadow hover:shadow-md transition"
            >
              <img
                src={item.phone.image}
                alt={item.phone.model}
                className="w-28 h-28 object-contain"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {item.phone.brand} {item.phone.model}
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Storage: {item.phone.storage} | Condition:{" "}
                  {item.phone.condition}
                </p>

                <p className="text-gray-700 font-bold mt-2">
                  ₹{item.phone.price}
                </p>

                {/* QUANTITY */}
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          id: item.phone._id,
                          quantity: Math.max(1, item.quantity - 1),
                        })
                      )
                    }
                    className="px-3 py-1 border rounded hover:bg-gray-100"
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
                        })
                      )
                    }
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    +
                  </button>

                  <button
                    onClick={() => dispatch(removeFromCart(item.phone._id))}
                    className="ml-auto text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PRICE SUMMARY */}
        <div className="bg-white p-6 rounded-xl shadow sticky top-24 h-fit space-y-4">
          <h3 className="text-xl font-semibold">Price Details</h3>

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{totalAmount}</span>
          </div>

          <div className="flex justify-between">
            <span>Platform Fee</span>
            <span className="text-green-600">FREE</span>
          </div>

          <hr />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition"
          >
            Proceed to Checkout
          </button>

          <button
            onClick={() => navigate("/sale")}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition"
          >
            Sell Your Phone
          </button>

          <button
            onClick={() => dispatch(clearCart())}
            className="w-full text-sm text-red-500 hover:underline"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* SUGGESTED PHONES */}
      {suggestedPhones.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">You may also like</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestedPhones.map((phone) => (
              <Link
                to={`/phone/${phone._id}`}
                key={phone._id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-md transition flex flex-col items-center"
              >
                <img
                  src={phone.image}
                  alt={phone.model}
                  className="h-28 object-contain mb-2"
                />
                <h4 className="font-semibold text-sm text-center">
                  {phone.brand} {phone.model}
                </h4>
                <p className="text-orange-500 font-bold mt-1">₹{phone.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
