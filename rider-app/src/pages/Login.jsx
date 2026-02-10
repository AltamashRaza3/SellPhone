import { useState } from "react";
import { useNavigate } from "react-router-dom";
import riderApi from "../api/riderApi";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      setError("Enter mobile number");
      return;
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await riderApi.post("/auth/send-otp", {
        phone: cleanPhone,
      });

      sessionStorage.setItem("rider_phone", cleanPhone);
      navigate("/verify-otp");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to send OTP. Please contact admin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold text-white">SellPhone Rider</h1>
          <p className="text-sm text-zinc-400">Login to continue deliveries</p>
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        {/* Input */}
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Mobile Number</label>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            maxLength={10}
            className="w-full h-12 rounded-xl bg-zinc-900 border border-white/10 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

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
