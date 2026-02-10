import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const rider = JSON.parse(localStorage.getItem("riderProfile"));

  const logout = () => {
    localStorage.removeItem("riderToken");
    localStorage.removeItem("riderProfile");
    sessionStorage.removeItem("rider_phone");
    navigate("/login", { replace: true });
  };

  if (!rider) {
    return (
      <div className="py-24 text-center text-zinc-400">
        Rider profile not found
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <p className="text-sm text-zinc-400">Rider account details</p>
      </div>

      {/* PROFILE CARD */}
      <div className="rounded-3xl bg-zinc-900 border border-white/10 p-6 space-y-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-black text-2xl font-bold">
          {rider.name?.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div>
          <p className="text-lg font-semibold text-white">{rider.name}</p>
          <p className="text-sm text-zinc-400">{rider.phone}</p>
        </div>

        {/* Status */}
        <div className="inline-flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full w-fit">
          ● Active Rider
        </div>
      </div>

      {/* LOGOUT */}
      <button
        onClick={logout}
        className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
