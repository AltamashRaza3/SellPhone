import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, authLoaded } = useSelector((state) => state.user);
  const location = useLocation();

  if (!authLoaded) {
    return null; // wait until Firebase resolves
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
