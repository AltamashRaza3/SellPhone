import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../utils/firebase";
import { toast } from "react-hot-toast";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      toast.error(err.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Logged in with Google");
    } catch (err) {
      toast.error(err.message || "Google auth failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>

        <button
          type="button"
          onClick={handleGoogleAuth}
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
