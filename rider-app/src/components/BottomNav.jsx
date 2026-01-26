import { NavLink } from "react-router-dom";
import { FiHome, FiUser, FiTrendingUp } from "react-icons/fi";

const BottomNav = () => {
  const base = "flex flex-col items-center justify-center flex-1 py-2 text-xs";
  const active = "text-emerald-400";
  const inactive = "text-zinc-400";

  return (
    <nav className="h-14 border-t border-white/10 bg-zinc-950 flex">
      <NavLink
        to="/pickups"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        <FiHome size={18} />
        <span>Pickups</span>
      </NavLink>

      <NavLink
        to="/earnings"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        <FiTrendingUp size={18} />
        <span>Earnings</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        <FiUser size={18} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
