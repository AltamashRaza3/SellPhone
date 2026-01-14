import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { auth } from "../utils/firebase";
import { clearUser } from "../redux/slices/userSlice";
import { removeFromCart, clearCart } from "../redux/slices/cartSlice";
import {
  FiSearch,
  FiMenu,
  FiX,
  FiPhone,
  FiShoppingCart,
  FiUser,
  FiPackage,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ================= SAFE SELECTORS ================= */
  const user = useSelector((state) => state.user?.user);
  const cartItems = useSelector((state) =>
    Array.isArray(state.cart?.items) ? state.cart.items : []
  );
  const phones = useSelector((state) =>
    Array.isArray(state.phones?.list) ? state.phones.list : []
  );

  /* ================= STATE ================= */
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDesktopCart, setShowDesktopCart] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);

  const cartRef = useRef(null);
  const suggestionRef = useRef(null);

  /* ================= LOGOUT ================= */
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

  /* ================= SEARCH ================= */
  const suggestions =
    search.trim().length === 0
      ? []
      : phones
          .filter((p) =>
            `${p.brand} ${p.model}`.toLowerCase().includes(search.toLowerCase())
          )
          .slice(0, 5);

  useEffect(() => {
    if (!search.trim()) return;
    const t = setTimeout(() => {
      navigate(`/?search=${encodeURIComponent(search)}`);
    }, 400);
    return () => clearTimeout(t);
  }, [search, navigate]);

  const selectSuggestion = (text, closeMobile = false) => {
    setSearch(text);
    setShowSuggestions(false);
    if (closeMobile) setMobileMenu(false);
    navigate(`/?search=${encodeURIComponent(text)}`);
  };

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const close = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target))
        setShowDesktopCart(false);
      if (suggestionRef.current && !suggestionRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-white to-orange-50/50 backdrop-blur-xl border-b border-orange-100/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        {/* TOP BAR */}
        <div className="py-4 flex items-center justify-between gap-4">
          {/* LOGO */}
          <div
            onClick={() => {
              setMobileMenu(false);
              navigate("/");
            }}
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

          {/* DESKTOP SEARCH */}
          <div
            ref={suggestionRef}
            className="hidden lg:flex flex-1 max-w-2xl mx-8 relative"
          >
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search phones..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-gray-200 bg-white"
            />

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 w-full bg-white rounded-2xl shadow-xl mt-2">
                {suggestions.map((p) => (
                  <li
                    key={p._id}
                    onMouseDown={() =>
                      selectSuggestion(`${p.brand} ${p.model}`)
                    }
                    className="px-6 py-4 hover:bg-orange-50 cursor-pointer"
                  >
                    <p className="font-semibold">{p.brand}</p>
                    <p className="text-sm text-gray-600">{p.model}</p>
                  </li>
                ))}
              </ul>
            )}
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

          {/* MOBILE CONTROLS */}
          <div className="lg:hidden flex gap-2">
            <button
              onClick={() => setMobileMenu((p) => !p)}
              className="p-2 bg-gray-100 rounded-xl"
            >
              {mobileMenu ? <FiX /> : <FiMenu />}
            </button>

            <button className="p-2 bg-gray-100 rounded-xl relative">
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
          <div className="lg:hidden px-2 pb-6 space-y-4 border-t border-gray-200/50">
            {/* MOBILE SEARCH */}
            <div className="relative">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Search phones..."
                className="w-full pl-14 pr-4 py-4 border rounded-2xl bg-white"
              />

              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl z-50">
                  {suggestions.map((p) => (
                    <li
                      key={p._id}
                      onMouseDown={() =>
                        selectSuggestion(`${p.brand} ${p.model}`, true)
                      }
                      className="px-4 py-3 hover:bg-orange-50 cursor-pointer"
                    >
                      <p className="font-semibold">{p.brand}</p>
                      <p className="text-sm text-gray-600">{p.model}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link
              to="/sale"
              onClick={() => setMobileMenu(false)}
              className="block w-full text-center py-4 rounded-2xl bg-orange-100 text-orange-700 font-bold"
            >
              Sell Phone
            </Link>

            {user && (
              <Link
                to="/orders"
                onClick={() => setMobileMenu(false)}
                className="block w-full text-center py-4 rounded-2xl bg-blue-100 text-blue-700 font-bold"
              >
                My Orders
              </Link>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenu(false)}
                className="block w-full text-center py-4 rounded-2xl bg-orange-200 text-orange-800 font-bold"
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
