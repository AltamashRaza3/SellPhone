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
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex justify-center items-center px-4">
      <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
        {/* App Title */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold text-white">SellPhone Rider</h1>
          <p className="text-sm text-zinc-400">Login to continue deliveries</p>
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        {/* Input */}
        <input
          type="tel"
          placeholder="Mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full h-12 rounded-xl bg-zinc-900 border border-white/10 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        {/* CTA */}
        <button
          onClick={sendOtp}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-black font-semibold shadow-lg active:scale-95 transition disabled:opacity-60"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
};

export default Login;
