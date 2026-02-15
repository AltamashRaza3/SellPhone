import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "../utils/firebase";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { mergeGuestCart } from "../redux/slices/cartSlice";
import API_BASE_URL from "../config/api";

/* ================= VALIDATION ================= */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const nameRegex = /^[A-Za-z ]{2,30}$/;

const Auth = () => {
  const dispatch = useDispatch();

  const [isSignInForm, setIsSignInForm] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ================= CART MERGE ================= */
  const mergeCartAfterLogin = () => {
    const guestCart = JSON.parse(localStorage.getItem("guest_cart")) || [];
    if (guestCart.length) dispatch(mergeGuestCart(guestCart));
  };

  /* ================= BACKEND SESSION ================= */
  const createBackendSession = async () => {
    const user = auth.currentUser;
    const idToken = await user.getIdToken();

    const res = await fetch(`${API_BASE_URL}/api/auth/firebase-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) throw new Error("Backend session failed");
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await createBackendSession();
      mergeCartAfterLogin();
      toast.success("Logged in successfully");
    } catch (err) {
      toast.error(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    const e = {};
    if (!emailRegex.test(email)) e.email = "Enter a valid email address.";

    if (!isForgotMode) {
      if (!isSignInForm && !nameRegex.test(name))
        e.name = "Enter a valid full name.";

      if (!passwordRegex.test(password))
        e.password =
          "Password must include uppercase, lowercase, number & symbol.";

      if (!isSignInForm && password !== confirmPassword)
        e.confirmPassword = "Passwords do not match.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      if (isForgotMode) {
        await sendPasswordResetEmail(auth, email);
        toast.success("Password reset email sent");
        setIsForgotMode(false);
        return;
      }

      if (isSignInForm) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(cred.user, { displayName: name });
      }

      await createBackendSession();
      mergeCartAfterLogin();
      toast.success("Authentication successful");
    } catch (err) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm">
        {/* LOGO */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            SalePhone
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-normal">
            Premium devices. Unmatched quality.
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl px-6 py-8 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] border border-white/50">
          {/* TITLE */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
              {isForgotMode
                ? "Reset Password"
                : isSignInForm
                  ? "Sign in"
                  : "Create Account"}
            </h2>
            <p className="mt-3 text-sm text-slate-500 font-normal max-w-[22rem] mx-auto leading-relaxed">
              {isSignInForm
                ? "Enter your email and password to continue."
                : "Join SalePhone and start shopping."}
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isSignInForm && !isForgotMode && (
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Full Name
                </label>
                <input
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 py-3 rounded-xl bg-slate-100/70 text-slate-900 text-sm placeholder-slate-500 font-normal border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all duration-200 hover:shadow-sm"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email
              </label>
              <input
                placeholder="apple@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 py-3 rounded-xl bg-slate-100/70 text-slate-900 text-sm placeholder-slate-500 font-normal border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all duration-200 hover:shadow-sm"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {!isForgotMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 px-4 py-3 rounded-xl bg-slate-100/70 text-slate-900 text-sm placeholder-slate-500 font-normal border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all duration-200 hover:shadow-sm"
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                {!isSignInForm && (
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 px-4 py-3 rounded-xl bg-slate-100/70 text-slate-900 text-sm placeholder-slate-500 font-normal border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all duration-200 hover:shadow-sm"
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-black text-white text-sm font-semibold tracking-tight shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Please wait…
                </span>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          {/* DIVIDER */}
          {!isForgotMode && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-semibold">
                  <span className="px-3 bg-white text-slate-400">or</span>
                </div>
              </div>

              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white text-slate-900 text-sm font-semibold tracking-tight shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2.5">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </span>
              </button>
            </>
          )}

          {/* FOOTER LINKS */}
          <div className="mt-10 text-center">
            {!isForgotMode && (
              <button
                onClick={() => setIsForgotMode(true)}
                className="block w-full text-sm font-medium text-slate-900 hover:text-black hover:underline transition-colors duration-200 py-1.5"
              >
                Forgot password?
              </button>
            )}

            <button
              onClick={() => {
                setIsSignInForm(!isSignInForm);
                setIsForgotMode(false);
              }}
              className="block w-full text-sm font-medium text-slate-900 hover:text-black hover:underline transition-colors duration-200 py-2 bg-gradient-to-r from-slate-50/50 to-transparent rounded-xl border border-slate-200/50"
            >
              {isSignInForm
                ? "Don't have an account? Create one"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
