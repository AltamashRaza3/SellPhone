const Profile = () => {
  const rider = JSON.parse(localStorage.getItem("riderProfile"));

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold">Profile</h1>

      {rider && (
        <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4">
          <p className="font-medium">{rider.name}</p>
          <p className="text-sm text-zinc-400">{rider.phone}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
