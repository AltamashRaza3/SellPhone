import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import riderApi from "../api/riderApi";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const phone = sessionStorage.getItem("rider_phone");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!phone) {
      navigate("/login", { replace: true });
    }
  }, []); 

  const handleVerify = async () => {
    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await riderApi.post(
        "/auth/verify-otp",
        { phone, otp: cleanOtp },
        { withCredentials: true },
      );

      if (!res?.data?.success) {
        setError("Login failed. Please contact admin.");
        return;
      }

      localStorage.setItem("riderProfile", JSON.stringify(res.data.rider));

      sessionStorage.removeItem("rider_phone");

      window.location.href = "/SellPhone/#/pickups";
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl">
        <h1 className="text-xl font-semibold text-white text-center">
          Verify OTP
        </h1>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <input
          type="tel"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 6-digit OTP"
          className="w-full h-12 rounded-xl bg-zinc-900 border border-white/10 text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          onClick={handleVerify}
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
