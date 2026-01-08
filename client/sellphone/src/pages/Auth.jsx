import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

const Auth = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) navigate("/");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in successfully!");
      }
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Logged in with Google!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-orange-400 to-orange-600 items-center justify-center">
        <h1 className="text-white text-5xl font-bold text-center leading-tight px-10">
          Buy & Sell <br /> Phones with Confidence
        </h1>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition"
            >
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create Account"
                : "Login"}
            </button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleAuth}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition"
          >
            Continue with Google
          </button>

          {/* Toggle Login/Signup */}
          <p className="text-center text-gray-500 mt-4">
            {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
            <span
              onClick={() => setIsSignup(!isSignup)}
              className="text-orange-500 font-medium cursor-pointer hover:underline ml-1"
            >
              {isSignup ? "Login" : "Create Account"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
