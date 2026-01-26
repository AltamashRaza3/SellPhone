import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import Pickups from "./pages/Pickups";
import PickupDetails from "./pages/PickupDetails";
import Earnings from "./pages/Earnings";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import RiderLayout from "./layout/RiderLayout";

const App = () => {
  return (
    <Routes>
      {/* Redirect root */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* Protected Routes */}
      <Route
        path="/pickups"
        element={
          <ProtectedRoute>
            <RiderLayout>
              <Pickups />
            </RiderLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/earnings"
        element={
          <ProtectedRoute>
            <RiderLayout>
              <Earnings />
            </RiderLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <RiderLayout>
              <Profile />
            </RiderLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pickups/:id"
        element={
          <ProtectedRoute>
            <RiderLayout>
              <PickupDetails />
            </RiderLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
