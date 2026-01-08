const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value="120" />
        <StatCard title="Total Users" value="58" />
        <StatCard title="Phones Listed" value="34" />
        <StatCard title="Revenue" value="₹4,25,000" />
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <p className="text-gray-500">{title}</p>
    <h2 className="text-2xl font-bold mt-2">{value}</h2>
  </div>
);

export default AdminDashboard;
