import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { auth } from "../utils/firebase";
import { clearUser } from "../redux/slices/userSlice";
import { removeFromCart, clearCart } from "../redux/slices/cartSlice";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items);
  const phones = useSelector((state) => state.phones.list);

  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDesktopCart, setShowDesktopCart] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartRef = useRef(null);
  const suggestionRef = useRef(null);

  // Logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      dispatch(clearUser());
      dispatch(clearCart());
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
    toast.success("Item removed");
  };

  // Search Suggestions
  const suggestions =
    search.trim().length === 0
      ? []
      : phones
          .filter((p) =>
            `${p.brand} ${p.model}`.toLowerCase().includes(search.toLowerCase())
          )
          .slice(0, 5);

  useEffect(() => {
    navigate(`/?search=${encodeURIComponent(search)}`);
  }, [search]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowDesktopCart(false);
      }
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (text) => {
    setSearch(text);
    setShowSuggestions(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <h1
          onClick={() => navigate("/", { replace: true })}
          className="text-2xl font-bold text-orange-500 cursor-pointer"
        >
          SalePhone
        </h1>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 relative" ref={suggestionRef}>
          <div className="flex items-center border rounded-full px-3 py-2 w-full">
            <FiSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search phones, brands..."
              className="w-full outline-none"
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-12 w-full bg-white border rounded-md shadow-lg z-50">
              {suggestions.map((p) => (
                <li
                  key={p._id}
                  onMouseDown={() =>
                    handleSelectSuggestion(`${p.brand} ${p.model}`)
                  }
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {p.brand} {p.model}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Desktop Right */}
        <div
          className="hidden md:flex items-center gap-4 relative"
          ref={cartRef}
        >
          {/* Sell Phone */}
          <Link
            to="/sale"
            className="px-4 py-2 rounded-full border border-orange-500 text-orange-500 font-medium hover:bg-orange-50 transition"
          >
            Sell Phone
          </Link>

          {/* My Orders */}
          {user && (
            <Link
              to="/orders"
              className="px-4 py-2 rounded-full border border-orange-500 text-orange-500 font-medium hover:bg-orange-50 transition"
            >
              My Orders
            </Link>
          )}

          {/* Desktop Cart */}
          <button
            onClick={() => setShowDesktopCart((prev) => !prev)}
            className="relative text-2xl"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {user && showDesktopCart && (
            <div className="absolute right-0 top-12 w-80 bg-white border rounded-xl shadow-lg p-4 z-50">
              {cartItems.length > 0 ? (
                <>
                  {cartItems.map((item) => (
                    <div
                      key={item.phone._id}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={item.phone.image}
                        alt={item.phone.model}
                        className="w-12 h-12 object-contain"
                      />
                      <div className="flex-1">
                        <p>
                          {item.phone.brand} {item.phone.model}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty {item.quantity} × ₹{item.phone.price}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.phone._id)}
                        className="text-xs text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <Link
                    to="/cart"
                    onClick={() => setShowDesktopCart(false)}
                    className="block mt-4 text-center bg-orange-500 text-white py-2 rounded-full"
                  >
                    Go to Cart
                  </Link>
                </>
              ) : (
                <p className="text-center text-gray-500">Cart is empty 🛒</p>
              )}
            </div>
          )}

          {/* Auth */}
          {user ? (
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/auth"
              className="px-5 py-2 rounded-full border border-orange-500 text-orange-500 font-medium hover:bg-orange-50"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger + Cart */}
        <div className="md:hidden flex items-center gap-4">
          <button onClick={() => setMobileMenu((prev) => !prev)}>
            {mobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Mobile Cart Button */}
          <button
            onClick={() => setShowMobileCart(true)}
            className="relative text-2xl"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden px-4 pb-4 space-y-4 border-t">
          <div className="flex items-center border rounded-full px-3 py-2 w-full">
            <FiSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search phones..."
              className="w-full outline-none"
            />
          </div>

          <Link
            to="/sale"
            onClick={() => setMobileMenu(false)}
            className="w-full block text-center px-5 py-2 rounded-full border border-orange-500 text-orange-500 font-medium hover:bg-orange-50 transition"
          >
            Sell Phone
          </Link>

          {user && (
            <Link
              to="/orders"
              onClick={() => setMobileMenu(false)}
              className="w-full block text-center px-5 py-2 rounded-full border border-orange-500 text-orange-500 font-medium hover:bg-orange-50 transition"
            >
              My Orders
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="w-full px-5 py-2 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/auth"
              className="w-full px-5 py-2 rounded-full border border-orange-500 text-orange-500 font-medium hover:bg-orange-50"
            >
              Login
            </Link>
          )}
        </div>
      )}

      {/* Mobile Cart Sidebar */}
      {showMobileCart && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-bold text-lg">Your Cart</h3>
            <button onClick={() => setShowMobileCart(false)}>
              <FiX size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.phone._id} className="flex items-center gap-3">
                  <img
                    src={item.phone.image}
                    alt={item.phone.model}
                    className="w-12 h-12 object-contain"
                  />
                  <div className="flex-1">
                    <p>
                      {item.phone.brand} {item.phone.model}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty {item.quantity} × ₹{item.phone.price}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.phone._id)}
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 mt-4">Cart is empty 🛒</p>
            )}
          </div>

          <Link
            to="/cart"
            onClick={() => setShowMobileCart(false)}
            className="m-4 bg-orange-500 text-white py-2 rounded-full text-center font-medium"
          >
            Go to Cart
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
