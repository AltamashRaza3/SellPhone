import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import Pickups from "./pages/Pickups";
import PickupDetails from "./pages/PickupDetails";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route
        path="/pickups"
        element={
          <ProtectedRoute>
            <Pickups />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pickups/:id"
        element={
          <ProtectedRoute>
            <PickupDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
