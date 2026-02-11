import { NavLink } from "react-router-dom";
import { Home, TrendingUp, User } from "lucide-react";

const BottomNav = () => {
  const base =
    "flex flex-col items-center justify-center flex-1 py-2 text-[11px] font-medium transition-all duration-200";

  return (
    <nav className="sticky bottom-0 z-40 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="max-w-[480px] mx-auto h-16 flex">
        <NavLink
          to="/pickups"
          className={({ isActive }) =>
            `${base} ${
              isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Home
                size={22}
                strokeWidth={2}
                className={`transition-transform duration-200 ${
                  isActive ? "scale-110" : ""
                }`}
              />
              <span className="mt-1">Pickups</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/earnings"
          className={({ isActive }) =>
            `${base} ${
              isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <TrendingUp
                size={22}
                strokeWidth={2}
                className={`transition-transform duration-200 ${
                  isActive ? "scale-110" : ""
                }`}
              />
              <span className="mt-1">Earnings</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${base} ${
              isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <User
                size={22}
                strokeWidth={2}
                className={`transition-transform duration-200 ${
                  isActive ? "scale-110" : ""
                }`}
              />
              <span className="mt-1">Profile</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
