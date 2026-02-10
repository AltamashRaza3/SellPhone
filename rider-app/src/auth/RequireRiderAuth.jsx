import { Navigate } from "react-router-dom";
import { useRiderAuth } from "./RiderAuthContext";

const RequireRiderAuth = ({ children }) => {
  const { isAuthenticated, authReady } = useRiderAuth();

  // ⏳ Wait until auth state is resolved
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Checking session…
      </div>
    );
  }

  // 🔒 Not logged in → redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireRiderAuth;
