import { useState } from "react";
import { useNavigate } from "react-router-dom";
import riderApi from "../api/riderApi";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!phone) {
      setError("Enter mobile number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await riderApi.post("/auth/send-otp", { phone });

      sessionStorage.setItem("rider_phone", phone);
      navigate("/verify-otp");
    } catch (err) {
      setError("Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-6 rounded-xl w-80 space-y-4">
        <h1 className="text-xl font-bold text-center">Rider Login</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="tel"
          placeholder="Mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 w-full rounded"
        />

        <button
          onClick={sendOtp}
          disabled={loading}
          className="bg-indigo-600 text-white w-full py-2 rounded"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
};

export default Login;
