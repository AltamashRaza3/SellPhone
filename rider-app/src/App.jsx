import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import Pickups from "./pages/Pickups";
import PickupDetails from "./pages/PickupDetails";
import Earnings from "./pages/Earnings";
import Profile from "./pages/Profile";

import RequireRiderAuth from "./auth/RequireRiderAuth";
import RiderLayout from "./layout/RiderLayout";

const App = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* Protected */}
      <Route
        path="/pickups"
        element={
          <RequireRiderAuth>
            <RiderLayout>
              <Pickups />
            </RiderLayout>
          </RequireRiderAuth>
        }
      />

      <Route
        path="/pickups/:id"
        element={
          <RequireRiderAuth>
            <RiderLayout>
              <PickupDetails />
            </RiderLayout>
          </RequireRiderAuth>
        }
      />

      <Route
        path="/earnings"
        element={
          <RequireRiderAuth>
            <RiderLayout>
              <Earnings />
            </RiderLayout>
          </RequireRiderAuth>
        }
      />

      <Route
        path="/profile"
        element={
          <RequireRiderAuth>
            <RiderLayout>
              <Profile />
            </RiderLayout>
          </RequireRiderAuth>
        }
      />
    </Routes>
  );
};

export default App;
