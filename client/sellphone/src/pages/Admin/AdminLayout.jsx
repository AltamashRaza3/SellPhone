import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearAdmin } from "../../redux/slices/adminSlice";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

/* ================== STYLES ================== */
const baseLink =
  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition";

const inactive = "text-gray-400 hover:text-white hover:bg-white/10";

const active =
  "bg-gradient-to-r from-orange-500/30 to-orange-600/10 text-orange-400 ring-1 ring-orange-500/30";

/* ================== COMPONENT ================== */
const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* 🔐 ADMIN LOGOUT (JWT BASED) */
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      dispatch(clearAdmin());
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0f0f0f] via-[#151515] to-[#1c1c1c]">
      {/* ================= MOBILE OVERLAY ================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-72
        bg-black/70 backdrop-blur-xl border-r border-white/10
        transform transition-transform duration-300
        ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              SalePhone
            </h1>
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Admin Panel
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavLink
            to="/admin"
            end
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `${baseLink} ${isActive ? active : inactive}`
            }
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="/admin/orders"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `${baseLink} ${isActive ? active : inactive}`
            }
          >
            📦 Orders
          </NavLink>

          <NavLink
            to="/admin/products"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `${baseLink} ${isActive ? active : inactive}`
            }
          >
            📱 Products
          </NavLink>

          <NavLink
            to="/admin/sell-phones"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `${baseLink} ${isActive ? active : inactive}`
            }
          >
            🔁 Sale Requests
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="px-4 py-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
              bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-white
              font-semibold transition"
          >
            ⏻ Sign Out
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center gap-4 px-6 py-4 border-b border-white/10 bg-black/50 backdrop-blur">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-300 hover:text-white"
          >
            <FiMenu size={22} />
          </button>
          <h2 className="text-white font-semibold tracking-wide">
            Admin Dashboard
          </h2>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
