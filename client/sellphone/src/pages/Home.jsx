import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect, useMemo } from "react";
import PhoneCard from "../components/PhoneCard";
import { FiFilter, FiX, FiTrash2 } from "react-icons/fi";

const Home = () => {
  // ✅ HARD DEFAULT — NEVER UNDEFINED
  const phoneList = useSelector((state) =>
    Array.isArray(state.phones?.items) ? state.phones.items : []
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialBrand = searchParams.get("brand") || "All";
  const initialPrice = searchParams.get("price") || "All";

  const [search, setSearch] = useState(initialSearch);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedPriceRange, setSelectedPriceRange] = useState(initialPrice);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ✅ SAFE BRAND DERIVATION
  const brands = useMemo(() => {
    return ["All", ...new Set(phoneList.map((p) => p?.brand).filter(Boolean))];
  }, [phoneList]);

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

  // ✅ BULLETPROOF FILTER
  const filteredPhones = useMemo(() => {
    return phoneList.filter((phone) => {
      const brand = phone?.brand || "";
      const model = phone?.model || "";
      const price = Number(phone?.price) || 0;

      const matchesSearch = `${brand} ${model}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesBrand = selectedBrand === "All" || brand === selectedBrand;

      const matchesPrice =
        selectedPriceRange === "All" ||
        (selectedPriceRange === "0-10000" && price <= 10000) ||
        (selectedPriceRange === "10001-30000" &&
          price >= 10001 &&
          price <= 30000) ||
        (selectedPriceRange === "30001-50000" &&
          price >= 30001 &&
          price <= 50000) ||
        (selectedPriceRange === "50000+" && price > 50000);

      return matchesSearch && matchesBrand && matchesPrice;
    });
  }, [phoneList, search, selectedBrand, selectedPriceRange]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedBrand("All");
    setSelectedPriceRange("All");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/40">
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-16 flex gap-8">
        <aside className="hidden md:block w-[250px] bg-white/90 border rounded-2xl p-5 sticky top-28">
          <div className="flex justify-between mb-5">
            <h3 className="text-sm font-semibold">Filters</h3>
            <button onClick={handleClearFilters}>
              <FiTrash2 size={14} />
            </button>
          </div>
        </aside>

        <main className="flex-1">
          {filteredPhones.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              No phones available
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPhones.map((phone) => (
                <PhoneCard key={phone._id} phone={phone} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
