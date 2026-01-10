import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAdmin } from "../../redux/slices/adminSlice";

/* 🔐 Allowed Admin Email */
const ADMIN_EMAIL = "admin@salephone.com";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: ADMIN_EMAIL,
    password: "",
  });

  const [loading, setLoading] = useState(false);

  /* -------------------- handlers -------------------- */

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const { email, password } = form;

    /* Basic validation */
    if (!email || !password) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      /* 🔒 Hard admin check */
      if (res.user.email !== ADMIN_EMAIL) {
        toast.error("Admin access only");
        await signOut(auth);
        setLoading(false);
        return;
      }

      /* ✅ Persist admin session */
      const adminData = {
        uid: res.user.uid,
        email: res.user.email,
        role: "admin",
        loggedInAt: Date.now(),
      };

      dispatch(setAdmin(adminData));
      localStorage.setItem("admin", JSON.stringify(adminData));

      toast.success("Admin dashboard unlocked");
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent),radial-gradient(circle_at_40%_40%,rgba(120,219,255,0.3),transparent)]" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-3xl px-8 py-6 border border-white/20 mb-8 mx-auto shadow-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-amber-600 rounded-xl flex items-center justify-center shadow-2xl">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  SellPhone Admin
                </h1>
                <p className="text-gray-400 text-base mt-2 uppercase tracking-wider">
                  Dashboard Access
                </p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-black/30 backdrop-blur-3xl border border-white/15 rounded-3xl p-12 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-white/80 uppercase mb-3">
                  Admin Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full h-16 px-6 bg-white/10 border border-white/20 rounded-3xl text-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-white/80 uppercase mb-3">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full h-16 px-6 bg-white/10 border border-white/20 rounded-3xl text-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 rounded-3xl text-white font-bold text-lg transition disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Login to Admin Dashboard"}
              </button>
            </form>

            <div className="text-center mt-10 text-xs text-white/50 uppercase tracking-wider">
              Authorized Personnel Only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
