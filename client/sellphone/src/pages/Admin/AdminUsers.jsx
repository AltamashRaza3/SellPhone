import { useSelector, useDispatch } from "react-redux";
import { toggleUserStatus } from "../../redux/slices/adminUsersSlice";

const AdminUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.adminUsers.users);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Users</h1>

      <div className="overflow-x-auto bg-black/40 border border-white/10 rounded-xl">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="bg-white/5 text-gray-400 uppercase">
            <tr>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="px-6 py-4">{user.email}</td>

                <td className="px-6 py-4 capitalize">{user.role}</td>

                <td
                  className={`px-6 py-4 font-semibold ${
                    user.status === "active" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {user.status}
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => dispatch(toggleUserStatus(user.id))}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition
                      ${
                        user.status === "active"
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/40"
                          : "bg-green-500/20 text-green-400 hover:bg-green-500/40"
                      }`}
                  >
                    {user.status === "active" ? "Block" : "Unblock"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
