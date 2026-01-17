import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./utils/firebase";

/* Redux */
import { setUser, clearUser } from "./redux/slices/userSlice";
import {
  setPhones,
  setPhonesLoading,
  setPhonesError,
} from "./redux/slices/phonesSlice";
import { setCartFromBackend } from "./redux/slices/cartSlice";

/* Layout */
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/* Pages */
import Home from "./pages/Home";
import SalePhone from "./pages/SalePhone";
import PhoneDetails from "./pages/PhoneDetails";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";

/* Guards */
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

/* Admin Pages */
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminAddProduct from "./pages/Admin/AdminAddProduct";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminOrders from "./pages/Admin/AdminOrder";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminSellPhones from "./pages/Admin/AdminSellPhone";
import AdminEditProduct from "./pages/Admin/AdminEditProduct";

/* UI */
import { Toaster } from "react-hot-toast";

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items);

  const [authLoaded, setAuthLoaded] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);

  const isAdminRoute = location.pathname.startsWith("/admin");

  /* ================= FIREBASE AUTH ================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch(
          setUser({
            email: firebaseUser.email,
            uid: firebaseUser.uid,
          })
        );
      } else {
        dispatch(clearUser());
      }
      setAuthLoaded(true);
    });

    return () => unsubscribe();
  }, [dispatch]);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      dispatch(setPhonesLoading());
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load products");
        }

        dispatch(setPhones(data));
      } catch (err) {
        dispatch(setPhonesError(err.message));
      }
    };

    fetchProducts();
  }, [dispatch]);

  /* ================= STEP 4: LOAD CART FROM BACKEND ================= */
  useEffect(() => {
    if (!authLoaded || !user?.uid) return;

    fetch(`http://localhost:5000/api/cart/${user.uid}`)
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        dispatch(setCartFromBackend(data.items || []));
        setCartLoaded(true);
      })
      .catch(() => {
        dispatch(setCartFromBackend([]));
        setCartLoaded(true);
      });
  }, [authLoaded, user?.uid, dispatch]);

  /* ================= STEP 6: SAVE CART TO BACKEND ================= */
  useEffect(() => {
    if (!authLoaded || !cartLoaded || !user?.uid) return;

    fetch("http://localhost:5000/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        items: cartItems.map((item) => ({
          phoneId: item.phone._id,
          quantity: item.quantity,
        })),
      }),
    }).catch((err) => {
      console.error("Cart sync failed", err);
    });
  }, [cartItems, authLoaded, cartLoaded, user?.uid]);

  /* ================= LOADING ================= */
  if (!authLoaded) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <ScrollToTop />
      <Toaster position="top-right" />

      <Routes>
        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ADMIN ROUTES */}
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
          <Route path="users" element={<AdminUsers />} />
          <Route path="sell-phones" element={<AdminSellPhones />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/add" element={<AdminAddProduct />} />
          <Route path="products/edit/:id" element={<AdminEditProduct />} />
        </Route>

        {/* USER ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/phone/:id" element={<PhoneDetails />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sale"
          element={
            <ProtectedRoute>
              <SalePhone />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
