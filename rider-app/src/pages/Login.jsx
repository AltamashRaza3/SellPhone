import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare } from "lucide-react";
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

      await riderApi.post("/auth/send-otp", { phone: cleanPhone });

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
          <p className="text-center text-gray-600 mb-10 text-[15px]">
            Sign in to continue
          </p>

          {error && (
            <p className="text-sm text-red-500 text-center mb-6">{error}</p>
          )}

          {/* ===== Input Section ===== */}
          <div className="space-y-3 mb-10">
            <label className="text-[15px] font-medium text-gray-700">
              Mobile Number
            </label>

            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 transition">
              <span className="px-5 py-3 text-gray-500 border-r border-gray-200">
                +91
              </span>

              <input
                type="tel"
                inputMode="numeric"
                placeholder="Enter your 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                className="flex-1 h-14 px-5 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* ===== Button ===== */}
          <button
            onClick={sendOtp}
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
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          {/* ===== Helper Text ===== */}
          <p className="text-sm text-gray-400 text-center mt-10">
            You will receive a One Time Password via SMS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
