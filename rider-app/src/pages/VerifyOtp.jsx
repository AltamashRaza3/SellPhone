import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare } from "lucide-react";
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
      navigate("/pickups", { replace: true });
      // window.location.href = "/SellPhone/#/pickups";
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-[#eef2f7] via-[#f6f8fb] to-[#e9edf4]">
      <div className="w-full max-w-[440px]">
        <div className="bg-white rounded-[36px] px-12 py-14 shadow-[0_50px_120px_rgba(37,99,235,0.15)]">
          {/* ===== Brand ===== */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <CheckSquare
              size={30}
              strokeWidth={2.5}
              className="text-blue-600"
            />
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              SellPhone <span className="text-blue-600">Rider</span>
            </h1>
          </div>

          {/* ===== Subtitle ===== */}
          <p className="text-center text-gray-600 mb-6 text-[15px]">
            Enter the verification code sent to
          </p>

          <p className="text-center text-blue-600 font-medium mb-10">
            +91 {phone}
          </p>

          {error && (
            <p className="text-sm text-red-500 text-center mb-6">{error}</p>
          )}

          {/* ===== OTP Input ===== */}
          <div className="mb-10">
            <input
              type="tel"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              className="
                w-full h-16 rounded-xl 
                border border-gray-200 
                bg-gray-50
                text-center text-2xl tracking-[0.3em]
                text-gray-900 placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition
              "
            />
          </div>

          {/* ===== Button ===== */}
          <button
            onClick={handleVerify}
            disabled={loading}
            className="
              w-full h-16 rounded-2xl 
              bg-gradient-to-r from-[#2563eb] to-[#3b82f6]
              text-white font-semibold text-lg
              shadow-[0_20px_50px_rgba(37,99,235,0.35)]
              transition-all duration-200
              hover:from-[#1e40af] hover:to-[#2563eb]
              active:scale-[0.97]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* ===== Helper Text ===== */}
          <p className="text-sm text-gray-400 text-center mt-10">
            Didn’t receive the code? Request again.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
