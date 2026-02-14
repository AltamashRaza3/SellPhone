import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./utils/firebase";
import API_BASE_URL from "./config/api";

/* ================= REDUX ================= */
import { setUser, clearUser } from "./redux/slices/userSlice";
import {
  setPhones,
  setPhonesLoading,
  setPhonesError,
} from "./redux/slices/phonesSlice";
import { setCartFromBackend } from "./redux/slices/cartSlice";

/* ================= LAYOUT ================= */
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppContainer from "./components/AppContainer";

/* ================= USER PAGES ================= */
import Landing from "./pages/Landing";
import Phones from "./pages/Phones";
import SalePhone from "./pages/sell/SalePhone";
import PhoneDetails from "./pages/PhoneDetails";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import SellRequestList from "./pages/sell/SellRequestsList";
import SellRequestDetails from "./pages/sell/SellRequestDetails";

/* ================= GUARDS ================= */
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

/* ================= ADMIN PAGES ================= */
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminOrders from "./pages/Admin/AdminOrder";
import AdminOrderDetails from "./pages/Admin/AdminOrderDetails";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminAddProduct from "./pages/Admin/AdminAddProduct";
import AdminEditProduct from "./pages/Admin/AdminEditProduct";
import AdminSellPhones from "./pages/Admin/AdminSellPhones";
import AdminTimeline from "./pages/Admin/AdminTimeline";
import AdminInventory from "./pages/Admin/AdminInventory";
import AdminRiders from "./pages/Admin/AdminRider";
import AdminAlerts from "./pages/Admin/AdminAlerts";
import RiderPerformance from "./pages/Admin/RiderPerformance";

/* ================= UI ================= */
import { Toaster } from "react-hot-toast";

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { user, authLoaded } = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.cart.items);

  const [cartLoaded, setCartLoaded] = useState(false);

  const isAdminRoute = location.pathname.startsWith("/admin");

  /* ================= FIREBASE AUTH ================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch(
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          }),
        );
      } else {
        dispatch(clearUser());
        dispatch(setCartFromBackend([]));
        setCartLoaded(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  /* ================= AUTH REDIRECT ================= */
  useEffect(() => {
    if (!authLoaded) return;

    if (user && location.pathname === "/auth") {
      navigate("/", { replace: true });
      return;
    }

    const isPublic =
      location.pathname === "/" ||
      location.pathname === "/phones" ||
      location.pathname.startsWith("/phone/") ||
      location.pathname === "/auth" ||
      location.pathname === "/cart";

    if (location.pathname.startsWith("/admin")) return;

    if (!user && !isPublic) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoaded, location.pathname, navigate]);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      dispatch(setPhonesLoading());
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        const data = await res.json();
        if (!res.ok) throw new Error("Failed to load products");
        dispatch(setPhones(data));
      } catch (err) {
        dispatch(setPhonesError(err.message));
      }
    };

    fetchProducts();
  }, [dispatch]);

  /* ================= LOAD CART ================= */
  useEffect(() => {
    if (!authLoaded || !user) return;

    fetch(`${API_BASE_URL}/api/cart/${user.uid}`)
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        dispatch(setCartFromBackend(data.items || []));
        setCartLoaded(true);
      })
      .catch(() => {
        dispatch(setCartFromBackend([]));
        setCartLoaded(true);
      });
  }, [authLoaded, user, dispatch]);

  /* ================= SYNC CART ================= */
  useEffect(() => {
    if (!authLoaded || !user || !cartLoaded) return;

    fetch(`${API_BASE_URL}/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        items: cartItems.map((item) => ({
          phoneId: item.phone._id,
          quantity: item.quantity,
        })),
      }),
    }).catch(() => {});
  }, [cartItems, authLoaded, cartLoaded, user]);

  /* ================= LOADER ================= */
  if (!authLoaded) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold">
        Loading…
      </div>
    );
  }

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <ScrollToTop />
      <Toaster position="top-right" />

      {!isAdminRoute ? (
        <Routes>
          {/* FULL WIDTH LANDING */}
          <Route path="/" element={<Landing />} />

          {/* APP PAGES (CENTERED) */}
          <Route
            path="/phones"
            element={
              <AppContainer>
                <Phones />
              </AppContainer>
            }
          />

          <Route
            path="/auth"
            element={
              <AppContainer>
                <Auth />
              </AppContainer>
            }
          />

          <Route
            path="/phone/:id"
            element={
              <AppContainer>
                <PhoneDetails />
              </AppContainer>
            }
          />

          <Route
            path="/cart"
            element={
              <AppContainer>
                <Cart />
              </AppContainer>
            }
          />

          <Route
            path="/checkout"
            element={
              <AppContainer>
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              </AppContainer>
            }
          />

          <Route
            path="/orders"
            element={
              <AppContainer>
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              </AppContainer>
            }
          />

          <Route
            path="/order/:id"
            element={
              <AppContainer>
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              </AppContainer>
            }
          />

          <Route
            path="/order-success/:orderId"
            element={
              <AppContainer>
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              </AppContainer>
            }
          />

          <Route
            path="/my-sell-requests"
            element={
              <AppContainer>
                <ProtectedRoute>
                  <SellRequestList />
                </ProtectedRoute>
              </AppContainer>
            }
          />

          <Route
            path="/my-sell-requests/:id"
            element={
              <AppContainer>
                <ProtectedRoute>
                  <SellRequestDetails />
                </ProtectedRoute>
              </AppContainer>
            }
          />

          <Route
            path="/sale"
            element={
              <AppContainer>
                <ProtectedRoute>
                  <SalePhone />
                </ProtectedRoute>
              </AppContainer>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetails />} />
            <Route path="sell-phones" element={<AdminSellPhones />} />
            <Route
              path="sell-phones/:id/timeline"
              element={<AdminTimeline />}
            />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/add" element={<AdminAddProduct />} />
            <Route path="products/edit/:id" element={<AdminEditProduct />} />
            <Route path="riders" element={<AdminRiders />} />
            <Route path="inventory" element={<AdminInventory />} />

            {/* ✅ Correct nested routes */}
            <Route path="alerts" element={<AdminAlerts />} />
            <Route path="rider-performance" element={<RiderPerformance />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      )}

      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
