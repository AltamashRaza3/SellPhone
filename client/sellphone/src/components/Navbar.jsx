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

  const isAuthPage = location.pathname.startsWith("/auth");

  /* ================= CLOSE MENUS ON ROUTE CHANGE ================= */
  useEffect(() => {
    setMobileMenuOpen(false);
    setDesktopCartOpen(false);
  }, [location.pathname]);

  /* ================= CLOSE CART ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setDesktopCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= LOGOUT ================= */
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
        className={`relative transition ${
          isActive ? "text-black" : "text-gray-600 hover:text-black"
        }`}
      >
        {label}
        <span
          className={`absolute left-0 -bottom-1 h-[1px] bg-black transition-all duration-300 ${
            isActive ? "w-full" : "w-0 group-hover:w-full"
          }`}
        />
      </Link>
    );
  };

  /* ================= MOBILE LINK ================= */
  const MobileNavLink = ({ to, label }) => (
    <Link to={to} className="block text-gray-700 hover:text-black transition">
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* ================= LOGO ================= */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer text-xl font-semibold tracking-tight text-gray-900 hover:opacity-80 transition"
        >
          SalePhone
        </div>

        {/* ================= DESKTOP NAV ================= */}
        <div className="hidden lg:flex items-center gap-10 text-sm font-medium">
          <NavLink to="/phones" label="Browse Phones" />
          <NavLink to="/sale" label="Sell Phone" />

          {user && (
            <>
              <NavLink to="/orders" label="Orders" />
              <NavLink to="/my-sell-requests" label="My Sales" />
            </>
          )}

          {/* ================= CART ================= */}
          <div className="relative" ref={cartRef}>
            <button
              onClick={() => setDesktopCartOpen((v) => !v)}
              className="relative p-2 hover:opacity-70 transition"
            >
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {desktopCartOpen && (
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center">
                    Your cart is empty
                  </p>
                ) : (
                  <>
                    {cartItems.map((item) => (
                      <div
                        key={item.phone._id}
                        className="flex justify-between items-start text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.phone.brand}
                          </p>
                          <p className="text-gray-500">{item.phone.model}</p>
                        </div>
                        <button
                          onClick={() =>
                            dispatch(removeFromCart(item.phone._id))
                          }
                          className="text-xs text-gray-400 hover:text-red-500 transition"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <Link
                      to="/cart"
                      className="block text-center bg-black text-white py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition"
                    >
                      View Cart
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ================= AUTH ================= */}
          {user ? (
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-black transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/auth"
              className="px-5 py-2 rounded-full bg-black text-white text-sm font-medium hover:opacity-90 transition"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* ================= MOBILE RIGHT ================= */}
        <div className="lg:hidden flex items-center gap-4">
          <button onClick={() => navigate("/cart")} className="relative">
            <FiShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button onClick={() => setMobileMenuOpen((v) => !v)}>
            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-6 py-6 space-y-5 text-sm font-medium">
            <MobileNavLink to="/phones" label="Browse Phones" />
            <MobileNavLink to="/sale" label="Sell Phone" />

            {user && (
              <>
                <MobileNavLink to="/orders" label="Orders" />
                <MobileNavLink to="/my-sell-requests" label="My Sales" />
              </>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left text-gray-600 hover:text-black"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="block w-full text-center bg-black text-white py-2.5 rounded-full"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
