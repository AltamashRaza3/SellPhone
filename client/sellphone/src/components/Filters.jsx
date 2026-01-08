const Filters = () => {
  return (
    <aside className="w-64 bg-white p-4 rounded-lg shadow-sm">
      <h2 className="font-semibold mb-4">Filters</h2>

      <div className="mb-4">
        <p className="font-medium mb-2">Brand</p>
        {["Apple", "Samsung", "OnePlus"].map((brand) => (
          <label key={brand} className="block text-sm">
            <input type="checkbox" className="mr-2" />
            {brand}
          </label>
        ))}
      </div>

      <div>
        <p className="font-medium mb-2">Condition</p>
        <select className="w-full border rounded-lg px-3 py-2">
          <option>Like New</option>
          <option>Good</option>
          <option>Average</option>
        </select>
      </div>
    </aside>
  );
};

export default Filters;
