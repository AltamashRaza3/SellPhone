import { Navigate } from "react-router-dom";
import { useRiderAuth } from "../auth/RiderAuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authReady } = useRiderAuth();

  // ⏳ Wait until auth is initialized
  if (!authReady) {
    return null; // or loader
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
