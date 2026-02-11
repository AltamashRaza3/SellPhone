import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const rider = JSON.parse(localStorage.getItem("riderProfile"));

  const logout = () => {
    localStorage.removeItem("riderProfile");
    sessionStorage.removeItem("rider_phone");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-[480px] mx-auto px-6 py-5 flex items-center justify-between">
        {/* Brand */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            SellPhone <span className="text-blue-600">Rider</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">{rider?.name || "Rider"}</p>
        </div>

        {/* Logout Icon */}
        <button
          onClick={logout}
          className="
            w-10 h-10 rounded-full
            flex items-center justify-center
            bg-gray-100 hover:bg-gray-200
            transition-all duration-200
            active:scale-95
          "
        >
          <LogOut size={16} className="text-gray-600" />
        </button>
      </div>
    </header>
  );
};

export default Header;
