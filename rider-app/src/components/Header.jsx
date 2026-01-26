import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const rider = JSON.parse(sessionStorage.getItem("rider"));

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-zinc-950 border-b border-white/10">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* App Title */}
        <div>
          <h1 className="text-base font-semibold tracking-wide text-white">
            SellPhone Rider
          </h1>
          <p className="text-xs text-zinc-400 leading-none">{rider?.name}</p>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="text-xs text-zinc-300 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
