import { useState } from "react";
import { useNavigate } from "react-router-dom";
import riderApi from "../api/riderApi";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const phone = sessionStorage.getItem("rider_phone");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!phone) {
    navigate("/login");
    return null;
  }

  const verifyOtp = async () => {
    if (!otp) {
      setError("Enter OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await riderApi.post("/auth/verify-otp", { phone, otp });

      localStorage.setItem("riderToken", res.data.token);
      localStorage.setItem("riderProfile", JSON.stringify(res.data.rider));

      navigate("/pickups");
    } catch {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-6 rounded-xl w-80 space-y-4">
        <h1 className="text-xl font-bold text-center">Verify OTP</h1>

        <p className="text-sm text-gray-500 text-center">OTP sent to {phone}</p>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="tel"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border p-2 w-full rounded"
        />

        <button
          onClick={verifyOtp}
          disabled={loading}
          className="bg-indigo-600 text-white w-full py-2 rounded"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
