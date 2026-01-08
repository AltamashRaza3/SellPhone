import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import PhoneCard from "../components/PhoneCard";
import { FiFilter, FiX, FiTrash2 } from "react-icons/fi";

const Home = () => {
  const phoneList = useSelector((state) => state.phones.list);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialBrand = searchParams.get("brand") || "All";
  const initialPrice = searchParams.get("price") || "All";

  const [search, setSearch] = useState(initialSearch);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedPriceRange, setSelectedPriceRange] = useState(initialPrice);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const brands = ["All", ...new Set(phoneList.map((p) => p.brand))];
  const priceRanges = [
    "All",
    "0-10000",
    "10001-30000",
    "30001-50000",
    "50000+",
  ];

  useEffect(() => {
    const params = {};
    if (search.trim()) params.search = search;
    if (selectedBrand !== "All") params.brand = selectedBrand;
    if (selectedPriceRange !== "All") params.price = selectedPriceRange;
    setSearchParams(params);
  }, [search, selectedBrand, selectedPriceRange, setSearchParams]);

  const filteredPhones = phoneList.filter((phone) => {
    const matchesSearch = `${phone.brand} ${phone.model}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesBrand =
      selectedBrand === "All" || phone.brand === selectedBrand;

    const matchesPrice =
      selectedPriceRange === "All" ||
      (selectedPriceRange === "0-10000" && phone.price <= 10000) ||
      (selectedPriceRange === "10001-30000" &&
        phone.price >= 10001 &&
        phone.price <= 30000) ||
      (selectedPriceRange === "30001-50000" &&
        phone.price >= 30001 &&
        phone.price <= 50000) ||
      (selectedPriceRange === "50000+" && phone.price > 50000);

    return matchesSearch && matchesBrand && matchesPrice;
  });

  const handleClearFilters = () => {
    setSearch("");
    setSelectedBrand("All");
    setSelectedPriceRange("All");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 flex gap-10">
      {/* ================= Desktop Filters ================= */}
      <aside className="hidden md:flex w-72 flex-col gap-6 bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-28 h-fit">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={handleClearFilters}
            className="p-2 rounded-full text-red-500 hover:bg-red-50 transition"
          >
            <FiTrash2 size={16} />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Brand</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
          >
            {brands.map((brand) => (
              <option key={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-200">
          <label className="text-sm font-medium text-gray-700">Price</label>
          <select
            value={selectedPriceRange}
            onChange={(e) => setSelectedPriceRange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
          >
            {priceRanges.map((range) => (
              <option key={range}>
                {range === "All" ? "All Prices" : `₹${range}`}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 leading-relaxed">
            Filter phones by brand and budget to find the best resale value
            instantly.
          </p>
        </div>
      </aside>

      {/* ================= Main Content ================= */}
      <main className="flex-1">
        {/* Mobile header */}
        <div className="md:hidden flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-900">
            {search ? `Results for "${search}"` : "Available Phones"}
          </h2>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full shadow active:scale-95"
          >
            <FiFilter size={18} /> Filters
          </button>
        </div>

        {/* Desktop title */}
        <h2 className="hidden md:block text-2xl font-bold text-gray-900 mb-6">
          {search ? (
            <>
              Search results for{" "}
              <span className="text-orange-500">“{search}”</span>
            </>
          ) : (
            "Available Phones"
          )}
        </h2>

        {filteredPhones.length === 0 ? (
          <div className="text-center text-gray-500 mt-16">
            <p className="text-base">No phones found 😕</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPhones.map((phone) => (
              <PhoneCard key={phone._id} phone={phone} />
            ))}
          </div>
        )}
      </main>

      {/* ================= Mobile Filter Sidebar ================= */}
      {showMobileFilters && (
        <div className="fixed left-0 top-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col p-5 border-r border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiX size={22} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {brands.map((brand) => (
                  <option key={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Price</label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {priceRanges.map((range) => (
                  <option key={range}>
                    {range === "All" ? "All Prices" : `₹${range}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowMobileFilters(false)}
            className="mt-auto bg-orange-500 text-white py-3 rounded-full font-medium shadow active:scale-95"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
