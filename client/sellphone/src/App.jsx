import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { setUser, clearUser } from "./redux/slices/userSlice";
import { auth } from "./utils/firebase";

import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import SalePhone from "./pages/SalePhone";
import PhoneDetails from "./pages/PhoneDetails";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Order";
import OrderDetails from "./pages/OrderDetails";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

import { Toaster } from "react-hot-toast";

/* 🔐 Admin Pages */
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrder";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSellPhones from "./pages/admin/AdminSellPhone";

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [authLoaded, setAuthLoaded] = useState(false);

  /* Detect admin routes */
  const isAdminRoute = location.pathname.startsWith("/admin");

  /* Firebase Auth Listener */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({ email: user.email, uid: user.uid }));
      } else {
        dispatch(clearUser());
      }
      setAuthLoaded(true);
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (!authLoaded) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* Hide Navbar on Admin */}
      {!isAdminRoute && <Navbar />}

      <ScrollToTop />
      <Toaster position="top-right" />

      <Routes>
        {/* ================= ADMIN LOGIN ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ================= ADMIN ROUTES ================= */}
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
        </Route>

        {/* ================= USER ROUTES ================= */}
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
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
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
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
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

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Hide Footer on Admin */}
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
