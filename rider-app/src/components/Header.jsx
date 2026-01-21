import { useNavigate } from "react-router-dom";

const Header = ({ title }) => {
  const navigate = useNavigate();

  const rider = JSON.parse(sessionStorage.getItem("rider"));

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sticky top-0 z-20 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold text-white">{title}</h1>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{rider?.name}</span>

          <button
            onClick={logout}
            className="text-xs text-red-400 border border-red-400 px-2 py-1 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
