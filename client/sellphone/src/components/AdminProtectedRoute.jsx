import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/me", {
          credentials: "include", // 🔥 send cookie
        });

        if (!res.ok) throw new Error("Unauthorized");

        setAuthorized(true);
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Checking admin access...
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
