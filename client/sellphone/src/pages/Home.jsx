import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect, useMemo } from "react";
import PhoneCard from "../components/PhoneCard";
import {
  FiFilter,
  FiSearch,
  FiX,
  FiTrash2,
  FiSmartphone,
} from "react-icons/fi";

const Home = () => {
  const navigate = useNavigate();

  const phones = useSelector((state) =>
    Array.isArray(state?.phones?.items) ? state.phones.items : []
  );

  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [brand, setBrand] = useState(params.get("brand") || "All");
  const [price, setPrice] = useState(params.get("price") || "All");

  const [showFilters, setShowFilters] = useState(false);

  const isMobile = () => window.innerWidth < 1024;

  const closeFilters = () => {
    if (isMobile()) setShowFilters(false);
  };

  const brands = useMemo(
    () => ["All", ...new Set(phones.map((p) => p?.brand).filter(Boolean))],
    [phones]
  );

  const prices = [
    { label: "All Prices", value: "All" },
    { label: "Below ₹10K", value: "0-10000" },
    { label: "₹10K - ₹30K", value: "10001-30000" },
    { label: "₹30K - ₹50K", value: "30001-50000" },
    { label: "Above ₹50K", value: "50000+" },
  ];

  useEffect(() => {
    const q = {};
    if (search) q.search = search;
    if (brand !== "All") q.brand = brand;
    if (price !== "All") q.price = price;
    setParams(q, { replace: true });
  }, [search, brand, price, setParams]);

  const filteredPhones = useMemo(() => {
    return phones.filter((p) => {
      const text = `${p?.brand} ${p?.model}`.toLowerCase();
      const priceNum = Number(p?.price) || 0;

      const s = text.includes(search.toLowerCase());
      const b = brand === "All" || p?.brand === brand;
      const pr =
        price === "All" ||
        (price === "0-10000" && priceNum <= 10000) ||
        (price === "10001-30000" && priceNum <= 30000 && priceNum >= 10001) ||
        (price === "30001-50000" && priceNum <= 50000 && priceNum >= 30001) ||
        (price === "50000+" && priceNum > 50000);

      return s && b && pr;
    });
  }, [phones, search, brand, price]);

  const clearAll = () => {
    setSearch("");
    setBrand("All");
    setPrice("All");
    closeFilters();
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ================= HERO (ISOLATED & CENTERED) ================= */}
      <section className="py-14">
        <div className="max-w-3xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <FiSmartphone className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Premium <span className="text-orange-600">Phones</span>
            </h1>
          </div>

          <p className="text-gray-600 text-lg text-center max-w-2xl mx-auto leading-relaxed">
            Buy refurbished smartphones with confidence. Every device is tested
            and ready to ship.
          </p>
        </div>
      </section>

      {/* ================= MOBILE FILTER BUTTON ================= */}
      <div className="lg:hidden px-4 mb-4">
        <button
          onClick={() => setShowFilters(true)}
          className="w-full bg-orange-500 text-white py-3 rounded-xl flex justify-center items-center gap-2"
        >
          <FiFilter /> Filters
        </button>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 flex gap-8">
        {/* FILTERS */}
        <aside
          className={`fixed inset-0 z-40 bg-black/40 lg:bg-transparent lg:static ${
            showFilters ? "block" : "hidden"
          } lg:block`}
        >
          <div className="bg-white w-[85%] max-w-sm lg:w-[260px] h-full lg:h-auto rounded-r-2xl lg:rounded-2xl p-5 shadow lg:sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden"
              >
                <FiX />
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search phones"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Brand */}
            <div className="mb-4 space-y-2">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setBrand(b);
                    closeFilters();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    brand === b ? "bg-orange-500 text-white" : "bg-gray-100"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Price */}
            <div className="mb-4 space-y-2">
              {prices.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    setPrice(p.value);
                    closeFilters();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    price === p.value
                      ? "bg-green-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={clearAll}
              className="w-full bg-red-100 text-red-600 py-2 rounded-lg flex justify-center gap-2"
            >
              <FiTrash2 /> Clear
            </button>
          </div>
        </aside>

        {/* PRODUCTS */}
        <main className="flex-1">
          <h2 className="text-xl font-semibold mb-4">
            {filteredPhones.length} Phones Available
          </h2>

          {filteredPhones.length === 0 ? (
            <div className="bg-white p-10 rounded-xl text-center shadow">
              No phones found
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPhones.map((phone) => (
                <PhoneCard
                  key={phone._id}
                  phone={phone}
                  onClick={() => navigate(`/phone/${phone._id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
