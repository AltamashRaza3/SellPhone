import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ADMIN_EMAIL = "admin@salephone.com";

const AdminProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user.user);

  if (!user) return <Navigate to="/admin/login" replace />;

  if (user.email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
