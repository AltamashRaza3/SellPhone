import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ADMIN_EMAIL = "admin@salephone.com";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      // ✅ Admin check
      if (res.user.email !== ADMIN_EMAIL) {
        toast.error("Access denied. Not an admin.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      toast.success("Admin logged in successfully!");
      navigate("/admin");
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-300 to-yellow-400 
                    flex items-center justify-center px-4 py-12 md:py-16"
    >
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10">
          {/* Welcome Back */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600 text-lg">Admin Dashboard Access</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Admin Email
              </label>
              <input
                type="email"
                placeholder="admin@salephone.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-lg"
                required
                disabled={loading}
              />

              <p className="text-xs text-orange-600 mt-1 hidden">
                Use: admin@salephone.com
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-lg"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 
                         disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl font-bold text-lg 
                         shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">Authorized personnel only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
