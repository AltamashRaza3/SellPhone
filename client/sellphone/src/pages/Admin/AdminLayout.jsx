import { NavLink, Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <h2 className="text-2xl font-bold text-orange-500 p-6">Admin Panel</h2>

        <nav className="flex flex-col space-y-2 px-4">
          <NavLink to="/admin" end className="admin-link">
            Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className="admin-link">
            Orders
          </NavLink>
          <NavLink to="/admin/users" className="admin-link">
            Users
          </NavLink>
          <NavLink to="/admin/sell-phones" className="admin-link">
            Sale Requests
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
