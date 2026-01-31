import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../utils/firebase";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { mergeGuestCart } from "../redux/slices/cartSlice";

/*
  Ensure in client/.env
  VITE_API_BASE_URL=http://localhost:5000
*/
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Auth = () => {
  const dispatch = useDispatch();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= MERGE GUEST CART ================= */
  const mergeCartAfterLogin = () => {
    try {
      const guestCart = JSON.parse(localStorage.getItem("guest_cart")) || [];

      if (guestCart.length > 0) {
        dispatch(mergeGuestCart(guestCart));
      }
    } catch (err) {
      console.error("CART MERGE ERROR:", err);
    }
  };

  /* ================= FIREBASE → BACKEND SESSION ================= */
  const createBackendSession = async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not available after Firebase login");
    }

    const idToken = await user.getIdToken();

    const res = await fetch(`${API_BASE_URL}/api/auth/firebase-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 🔥 cookie auth
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Backend session creation failed");
    }
  };

  /* ================= EMAIL / PASSWORD ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in");
      }

      await createBackendSession();
      mergeCartAfterLogin(); // 🔥 CRITICAL
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Logged in with Google");

      await createBackendSession();
      mergeCartAfterLogin(); // 🔥 CRITICAL
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-80 bg-black/30 p-6 rounded-xl"
      >
        <input
          className="input w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="input w-full"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full border rounded-lg py-2"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm">
          {isSignup ? "Already have an account?" : "New here?"}
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="ml-1 text-orange-500 font-semibold"
          >
            {isSignup ? "Login" : "Sign up"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Auth;
