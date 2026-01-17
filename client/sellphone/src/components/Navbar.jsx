import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { auth } from "../utils/firebase";
import { clearUser } from "../redux/slices/userSlice";
import { removeFromCart, clearCart } from "../redux/slices/cartSlice";
import {
  FiMenu,
  FiX,
  FiPhone,
  FiShoppingCart,
  FiPackage,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

/* MEMOIZED SELECTORS */
import {
  selectCartItems,
  selectCartCount,
} from "../redux/slices/selectors/cartSelectors";

const selectPhonesList = (state) => state.phones.list ?? [];

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  if (location.pathname.startsWith("/auth")) return null;

  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartCount);
  const phones = useSelector(selectPhonesList);

  const [mobileMenu, setMobileMenu] = useState(false);
  const [showDesktopCart, setShowDesktopCart] = useState(false);

  const cartRef = useRef(null);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      dispatch(clearUser());
      dispatch(clearCart());
      toast.success("Logged out");
      setMobileMenu(false);
      navigate("/auth");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
    toast.success("Item removed");
  };

  useEffect(() => {
    const close = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setShowDesktopCart(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-white to-orange-50/50 backdrop-blur-xl border-b border-orange-100/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-4 flex items-center justify-between">
          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <FiPhone className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent">
                SalePhone
              </h1>
              <p className="text-xs text-gray-500">Second Hand Phones</p>
            </div>
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden lg:flex items-center gap-4" ref={cartRef}>
            <Link
              to="/sale"
              className="px-6 py-3 rounded-2xl bg-orange-100 text-orange-700 font-semibold"
            >
              Sell Phone
            </Link>

            {user && (
              <Link
                to="/orders"
                className="px-6 py-3 rounded-2xl bg-blue-100 text-blue-700 font-semibold"
              >
                <FiPackage className="inline mr-1" /> Orders
              </Link>
            )}

            {/* CART */}
            <div className="relative">
              <button
                onClick={() => setShowDesktopCart((p) => !p)}
                className="p-3 bg-gray-100 rounded-2xl relative"
              >
                <FiShoppingCart />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {user && showDesktopCart && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl p-4">
                  {cartItems.length === 0 ? (
                    <p className="text-center text-gray-500">Cart is empty</p>
                  ) : (
                    cartItems.map((i) => (
                      <div
                        key={i.phone._id}
                        className="flex justify-between mb-3"
                      >
                        <div>
                          <p className="font-semibold">{i.phone.brand}</p>
                          <p className="text-sm text-gray-600">
                            {i.phone.model}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(i.phone._id)}
                          className="text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}

                  <Link
                    to="/cart"
                    onClick={() => setShowDesktopCart(false)}
                    className="block mt-4 bg-orange-500 text-white py-3 rounded-xl text-center font-bold"
                  >
                    Checkout →
                  </Link>
                </div>
              )}
            </div>

            {user ? (
              <button
                onClick={handleLogout}
                className="px-6 py-3 rounded-2xl bg-gray-900 text-white font-bold"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="px-6 py-3 rounded-2xl bg-orange-100 text-orange-700 font-bold"
              >
                Login
              </Link>
            )}
          </div>

          {/* MOBILE ACTIONS */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenu((p) => !p)}
              className="p-2 bg-gray-100 rounded-xl"
            >
              {mobileMenu ? <FiX /> : <FiMenu />}
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="p-2 bg-gray-100 rounded-xl relative"
            >
              <FiShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenu && (
          <div className="lg:hidden pb-4 space-y-3 border-t border-gray-200">
            <Link
              to="/sale"
              onClick={() => setMobileMenu(false)}
              className="block w-full text-center py-3 rounded-xl bg-orange-100 text-orange-700 font-bold"
            >
              Sell Phone
            </Link>

            {user && (
              <Link
                to="/orders"
                onClick={() => setMobileMenu(false)}
                className="block w-full text-center py-3 rounded-xl bg-blue-100 text-blue-700 font-bold"
              >
                My Orders
              </Link>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenu(false)}
                className="block w-full text-center py-3 rounded-xl bg-orange-200 text-orange-800 font-bold"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
