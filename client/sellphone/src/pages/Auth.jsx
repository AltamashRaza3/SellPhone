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

import API_BASE_URL from "../utils/api";


/* ================= VALIDATION ================= */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
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

      toast.success("Logged in with Google");
      await createBackendSession();
      mergeCartAfterLogin();
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
          "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";

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
        toast.success("Logged in successfully");
      } else {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(cred.user, { displayName: name });
        toast.success("Account created successfully");
      }

      await createBackendSession();
      mergeCartAfterLogin();
    } catch (err) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black px-4">
      <div className="absolute inset-0 bg-black/60" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-xl p-10 rounded-lg text-white shadow-2xl border border-white/10 space-y-4"
      >
        <h1 className="text-3xl font-bold">
          {isForgotMode
            ? "Reset Password"
            : isSignInForm
              ? "Sign In"
              : "Create Account"}
        </h1>

        {!isSignInForm && !isForgotMode && (
          <>
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded bg-[#1A1A1A] border border-gray-700 focus:ring-2 focus:ring-orange-500"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </>
        )}

        <input
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 px-4 rounded bg-[#1A1A1A] border border-gray-700 focus:ring-2 focus:ring-orange-500"
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}

        {!isForgotMode && (
          <>
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded bg-[#1A1A1A] border border-gray-700 focus:ring-2 focus:ring-orange-500"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}

            {!isSignInForm && (
              <>
                <input
                  placeholder="Confirm password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 px-4 rounded bg-[#1A1A1A] border border-gray-700 focus:ring-2 focus:ring-orange-500"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-orange-600 hover:bg-orange-700 transition rounded font-semibold disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Submit"}
        </button>

        {/* Divider */}
        {!isForgotMode && (
          <div className="flex items-center">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="px-3 text-xs text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>
        )}

        {/* Google Login */}
        {!isForgotMode && (
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full h-12 border border-gray-700 rounded hover:border-gray-500 transition"
          >
            Continue with Google
          </button>
        )}

        {!isForgotMode && (
          <button
            type="button"
            onClick={() => setIsForgotMode(true)}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Forgot password?
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setIsSignInForm(!isSignInForm);
            setIsForgotMode(false);
          }}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          {isSignInForm ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default Auth;
