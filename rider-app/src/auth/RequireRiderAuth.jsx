import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import riderApi from "../api/riderApi";

const RequireRiderAuth = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await riderApi.get("/pickups", {
          withCredentials: true,
        });
        setAuthenticated(true);
      } catch (err) {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Checking session…
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireRiderAuth;
