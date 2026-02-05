import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API_BASE_URL from "../utils/api";

const AdminProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const checkAdminAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/me`, {
          method: "GET",
          credentials: "include", // ✅ JWT cookie
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Unauthorized");

        setAuthorized(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          setAuthorized(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();

    return () => controller.abort();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-lg font-semibold">
        Verifying admin access…
      </div>
    );
  }

  /* ================= UNAUTHORIZED ================= */
  if (!authorized) {
    return <Navigate to="/admin/login" replace />;
  }

  /* ================= AUTHORIZED ================= */
  return children;
};

export default AdminProtectedRoute;
