import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import riderApi from "../api/riderApi";
import { useRiderAuth } from "../auth/RiderAuthContext";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const phone = sessionStorage.getItem("rider_phone");
  const { login } = useRiderAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= SAFETY ================= */
  useEffect(() => {
    if (!phone) {
      navigate("/login", { replace: true });
    }
  }, [phone, navigate]);

  const verifyOtp = async () => {
    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await riderApi.post("/auth/verify-otp", {
        phone,
        otp: cleanOtp,
      });

      // ✅ SINGLE SOURCE OF TRUTH
      login(res.data.token); // updates context + localStorage
      localStorage.setItem("riderProfile", JSON.stringify(res.data.rider));

      sessionStorage.removeItem("rider_phone");

      navigate("/pickups", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-6">
        <h1 className="text-xl font-semibold text-white text-center">
          Verify OTP
        </h1>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <input
          type="tel"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter OTP"
          className="w-full h-12 rounded-xl bg-zinc-900 border border-white/10 text-white text-center"
        />

        <button
          onClick={verifyOtp}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-emerald-600 text-black font-semibold"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
