import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { auth } from "../utils/firebase";
import { clearUser } from "../redux/slices/userSlice";
import { clearCart, removeFromCart } from "../redux/slices/cartSlice";
import { FiMenu, FiX, FiShoppingCart } from "react-icons/fi";
import { toast } from "react-hot-toast";
import {
  selectCartItems,
  selectCartCount,
} from "../redux/slices/selectors/cartSelectors";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartCount);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopCartOpen, setDesktopCartOpen] = useState(false);

  const cartRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const isAuthPage = location.pathname.startsWith("/auth");

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDesktopCartOpen(false);
  }, [location.pathname]);

  // Desktop cart click outside handler
  useEffect(() => {
    const handler = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setDesktopCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Mobile menu click outside handler
  useEffect(() => {
    const handler = (e) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest("[data-hamburger]")
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await auth.signOut();
    dispatch(clearUser());
    dispatch(clearCart());
    navigate("/");
    toast.success("Logged out");
  };

  if (isAuthPage) return null;

  /* ================= DESKTOP LINK ================= */
  const NavLink = ({ to, label }) => {
    const isActive = location.pathname === to;

    return (
      <Link
        to={to}
        className={`
          relative text-sm font-medium text-neutral-700 hover:text-black transition-all duration-200 ease-out
          after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-black 
          after:transition-all after:duration-200 after:ease-out
          ${
            isActive
              ? "after:w-full text-black"
              : "after:w-0 hover:after:w-full"
          }
        `}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter:blur(20px)]:bg-white/90">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* LOGO - Apple style */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer text-xl font-semibold tracking-tight text-black hover:opacity-80 transition-opacity duration-200 select-none"
        >
          SalePhone
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-10">
          <NavLink to="/phones" label="Browse Phones" />
          <NavLink to="/sale" label="Sell Phone" />

          {user && (
            <>
              <NavLink to="/orders" label="Orders" />
              <NavLink to="/my-sell-requests" label="My Sales" />
            </>
          )}

          {/* DESKTOP CART */}
          <div className="relative" ref={cartRef}>
            <button
              onClick={() => setDesktopCartOpen((v) => !v)}
              className="relative p-1.5 hover:bg-neutral-100 rounded-full transition-all duration-200"
              data-testid="desktop-cart"
            >
              <FiShoppingCart className="w-5.5 h-5.5 text-neutral-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Desktop Cart Dropdown */}
            {desktopCartOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl shadow-xl p-6 space-y-4 origin-top-right animate-in slide-in-from-top-2 duration-200">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-neutral-100 rounded-xl flex items-center justify-center">
                      <FiShoppingCart className="w-6 h-6 text-neutral-400" />
                    </div>
                    <p className="text-neutral-500 text-sm font-medium">
                      Your cart is empty
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div
                          key={item.phone._id}
                          className="flex items-start justify-between gap-3 p-3 hover:bg-neutral-50 rounded-xl transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-neutral-900 truncate">
                              {item.phone.brand}
                            </p>
                            <p className="text-neutral-500 text-sm truncate">
                              {item.phone.model}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              dispatch(removeFromCart(item.phone._id))
                            }
                            className="text-xs text-neutral-400 hover:text-red-500 font-medium px-2 py-1 hover:bg-red-50 rounded-lg transition-all duration-150"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <Link
                      to="/cart"
                      className="block w-full bg-black text-white py-3 rounded-xl text-sm font-semibold text-center hover:bg-neutral-900 transition-all duration-200"
                      onClick={() => setDesktopCartOpen(false)}
                    >
                      View Cart ({cartCount})
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* AUTH BUTTONS */}
          {user ? (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-neutral-700 hover:text-black px-4 py-2 hover:bg-neutral-100 rounded-full transition-all duration-200"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/auth"
              className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-neutral-900 hover:shadow-lg hover:shadow-black/10 transition-all duration-200 active:scale-[0.98]"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* MOBILE ACTIONS */}
        <div className="lg:hidden flex items-center gap-4">
          <button
            onClick={() => navigate("/cart")}
            className="relative p-1.5 hover:bg-neutral-100 rounded-full transition-all duration-200"
            data-testid="mobile-cart"
          >
            <FiShoppingCart className="w-6 h-6 text-neutral-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </button>

          {/* HAMBURGER BUTTON - FIXED */}
          <button
            ref={(el) => el && el.setAttribute("data-hamburger", "true")}
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-1.5 hover:bg-neutral-100 rounded-full transition-all duration-200 lg:hidden z-50"
            data-testid="hamburger"
          >
            {mobileMenuOpen ? (
              <FiX className="w-6 h-6 text-neutral-700" />
            ) : (
              <FiMenu className="w-6 h-6 text-neutral-700" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU - FIXED & APPLE-STYLED */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden absolute top-full left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-neutral-200 shadow-xl animate-in slide-in-from-top-4 duration-200"
        >
          <nav className="px-6 pb-8 pt-6 space-y-2">
            <Link
              to="/phones"
              className="block py-4 px-4 text-base font-semibold text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Phones
            </Link>
            <Link
              to="/sale"
              className="block py-4 px-4 text-base font-semibold text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sell Phone
            </Link>

            {user && (
              <>
                <Link
                  to="/orders"
                  className="block py-4 px-4 text-base font-semibold text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  to="/my-sell-requests"
                  className="block py-4 px-4 text-base font-semibold text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Sales
                </Link>
              </>
            )}

            <div className="pt-4 mt-4 border-t border-neutral-200">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-4 px-4 text-base font-semibold text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="block w-full bg-black text-white py-4 px-6 rounded-xl text-base font-semibold text-center hover:bg-neutral-900 hover:shadow-lg hover:shadow-black/20 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
