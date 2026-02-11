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
    <div className="py-24 text-center text-gray-400">
      Rider profile not found
    </div>
  );
}



  return (
    <div className="space-y-14">
      {/* ===== Header ===== */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Profile
        </h1>
        <p className="text-sm text-gray-500 mt-3">Rider account details</p>
      </div>

      {/* ===== Profile Card ===== */}
      <div className="bg-white rounded-[28px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-8">
        {/* Avatar */}
        <div className="flex justify-center">
          <div
            className="
          w-24 h-24
          rounded-full
          bg-gradient-to-br from-blue-500 to-blue-600
          text-white
          text-3xl
          font-semibold
          flex items-center justify-center
          shadow-[0_10px_30px_rgba(37,99,235,0.35)]
        "
          >
            {rider.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Info */}
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold text-gray-900">{rider.name}</p>
          <p className="text-sm text-gray-500">+91 {rider.phone}</p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <div
            className="
          inline-flex items-center gap-2
          text-sm font-medium
          text-green-600
          bg-green-50
          px-4 py-2
          rounded-full
        "
          >
            ● Active Rider
          </div>
        </div>
      </div>

      {/* ===== Logout Button ===== */}
      <button
        onClick={logout}
        className="
        w-full h-14 rounded-2xl
        bg-gradient-to-r from-red-600 to-red-500
        text-white font-semibold
        shadow-[0_10px_30px_rgba(220,38,38,0.35)]
        hover:from-red-700 hover:to-red-600
        active:scale-[0.98]
        transition-all
      "
      >
        Logout
      </button>
    </div>
  );


};

export default Profile;
