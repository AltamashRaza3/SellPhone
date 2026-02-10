import { NavLink } from "react-router-dom";
import { FiHome, FiUser, FiTrendingUp } from "react-icons/fi";

const BottomNav = () => {
  const base =
    "flex flex-col items-center justify-center flex-1 py-1 text-[11px] transition";
  const active = "text-emerald-400";
  const inactive = "text-zinc-400";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 h-14 border-t border-white/10 bg-zinc-950 flex safe-area-bottom">
      <NavLink
        to="/pickups"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        <FiHome size={18} />
        <span className="mt-0.5">Pickups</span>
      </NavLink>

      <NavLink
        to="/earnings"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        <FiTrendingUp size={18} />
        <span className="mt-0.5">Earnings</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        <FiUser size={18} />
        <span className="mt-0.5">Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
