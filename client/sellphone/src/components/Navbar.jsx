import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { auth } from "../utils/firebase";
import { clearUser } from "../redux/slices/userSlice";
import { clearCart, removeFromCart } from "../redux/slices/cartSlice";
import {
  FiMenu,
  FiX,
  FiPhone,
  FiShoppingCart,
  FiPackage,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import {
  selectCartItems,
  selectCartCount,
} from "../redux/slices/selectors/cartSelectors";

const Navbar = () => {
  /* ================= HOOKS (NEVER CONDITIONAL) ================= */
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartCount);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopCartOpen, setDesktopCartOpen] = useState(false);

  const cartRef = useRef(null);

  /* ================= ROUTE AWARENESS ================= */
  const isAuthPage = location.pathname.startsWith("/auth");

  /* ================= CLEANUP ON ROUTE CHANGE ================= */
  useEffect(() => {
    setMobileMenuOpen(false);
    setDesktopCartOpen(false);
  }, [location.pathname]);

  /* ================= CLICK OUTSIDE CART ================= */
  useEffect(() => {
    const handler = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setDesktopCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= ACTIONS ================= */
  const handleSellPhone = () => {
    if (!user) {
      toast("Please login to sell your phone");
      navigate("/auth", { state: { redirectTo: "/sale" } });
      return;
    }
    navigate("/sale");
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      dispatch(clearUser());
      dispatch(clearCart());
      navigate("/auth", { replace: true });
      toast.success("Logged out");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const handleRemoveFromCart = (id) => {
    dispatch(removeFromCart(id));
  };

  /* ================= HIDE NAVBAR VISUALLY (NOT LOGICALLY) ================= */
  if (isAuthPage) {
    return <div />; // keeps hooks consistent
  }

  /* ================= RENDER ================= */
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center">
              <FiPhone className="text-white" size={22} />
            </div>
            <div>
              <p className="font-black text-xl">SalePhone</p>
              <p className="text-xs text-gray-500">Second Hand Phones</p>
            </div>
          </div>

          {/* DESKTOP */}
          <div className="hidden lg:flex items-center gap-4" ref={cartRef}>
            <button
              onClick={handleSellPhone}
              className="px-5 py-2 rounded-xl bg-orange-100 text-orange-700 font-semibold"
            >
              Sell Phone
            </button>

            {user && (
              <>
                <Link
                  to="/orders"
                  className="px-5 py-2 rounded-xl bg-blue-100 text-blue-700 font-semibold"
                >
                  <FiPackage className="inline mr-1" />
                  Orders
                </Link>

                <Link
                  to="/my-sell-requests"
                  className="px-5 py-2 rounded-xl bg-purple-100 text-purple-700 font-semibold"
                >
                  My Sell Requests
                </Link>
              </>
            )}

            {/* CART */}
            <div className="relative">
              <button
                onClick={() => setDesktopCartOpen((v) => !v)}
                className="p-3 bg-gray-100 rounded-xl relative"
              >
                <FiShoppingCart />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {desktopCartOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-lg p-4">
                  {cartItems.length === 0 ? (
                    <p className="text-gray-500 text-center">Cart is empty</p>
                  ) : (
                    cartItems.map((item) => (
                      <div
                        key={item.phone._id}
                        className="flex justify-between mb-3"
                      >
                        <div>
                          <p className="font-medium">{item.phone.brand}</p>
                          <p className="text-sm text-gray-500">
                            {item.phone.model}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.phone._id)}
                          className="text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}

                  <Link
                    to="/cart"
                    className="block mt-4 text-center bg-orange-500 text-white py-2 rounded-lg font-semibold"
                  >
                    Checkout →
                  </Link>
                </div>
              )}
            </div>

            {user ? (
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-xl bg-gray-900 text-white font-semibold"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="px-5 py-2 rounded-xl bg-orange-100 text-orange-700 font-semibold"
              >
                Login
              </Link>
            )}
          </div>

          {/* MOBILE */}
          <button
            className="lg:hidden p-2 rounded-lg bg-gray-100"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 space-y-3 border-t">
            <button
              onClick={handleSellPhone}
              className="w-full py-3 rounded-xl bg-orange-100 text-orange-700 font-bold"
            >
              Sell Phone
            </button>

            {user && (
              <>
                <Link
                  to="/orders"
                  className="block text-center py-3 rounded-xl bg-blue-100 text-blue-700 font-bold"
                >
                  My Orders
                </Link>

                <Link
                  to="/my-sell-requests"
                  className="block text-center py-3 rounded-xl bg-purple-100 text-purple-700 font-bold"
                >
                  My Sell Requests
                </Link>
              </>
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
                className="block text-center py-3 rounded-xl bg-orange-200 text-orange-800 font-bold"
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
