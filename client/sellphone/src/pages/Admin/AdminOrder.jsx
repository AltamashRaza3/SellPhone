const AdminOrders = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Orders</h1>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t">
              <td className="p-3">ORD12345</td>
              <td className="p-3">Altamash</td>
              <td className="p-3">₹24,999</td>
              <td className="p-3 text-green-600">Delivered</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
