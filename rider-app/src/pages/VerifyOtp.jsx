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
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex justify-center items-center px-4">
      <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold text-white">Verify OTP</h1>
          <p className="text-sm text-zinc-400">OTP sent to {phone}</p>
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        {/* OTP Input */}
        <input
          type="tel"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full h-12 rounded-xl bg-zinc-900 border border-white/10 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center tracking-widest"
        />

        {/* CTA */}
        <button
          onClick={verifyOtp}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-black font-semibold shadow-lg active:scale-95 transition disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
