import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import riderApi from "../api/riderApi";

const RequireRiderAuth = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        await riderApi.get("/me", {
          withCredentials: true,
        });

        if (mounted) setAuthenticated(true);
      } catch {
        if (mounted) setAuthenticated(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Checking session...
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireRiderAuth;
