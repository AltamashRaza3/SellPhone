import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect, useMemo } from "react";
import PhoneCard from "../components/PhoneCard";
import { FiFilter, FiX, FiTrash2, FiSmartphone } from "react-icons/fi";


const Home = () => {
  const phones = useSelector((state) =>
    Array.isArray(state?.phones?.items) ? state.phones.items : []
  );

  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [brand, setBrand] = useState(params.get("brand") || "All");
  const [price, setPrice] = useState(params.get("price") || "All");
  const [showFilters, setShowFilters] = useState(false);

  const isMobile = () => window.innerWidth < 1024;
  const closeFilters = () => isMobile() && setShowFilters(false);

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
        (price === "10001-30000" && priceNum >= 10001 && priceNum <= 30000) ||
        (price === "30001-50000" && priceNum >= 30001 && priceNum <= 50000) ||
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
    
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-20">
        {/* ================= HERO ================= */}
        <section className="pt-12 pb-10 text-center">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <FiSmartphone className="text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold">
              Premium <span className="text-orange-500">Phones</span>
            </h1>
          </div>

          {/* <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Buy refurbished smartphones with confidence. Every device is tested
            and ready to ship.
          </p> */}
        </section>

        {/* ================= MOBILE FILTER ================= */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(true)}
            className="w-full bg-orange-500 text-white py-3 rounded-xl flex justify-center gap-2"
          >
            <FiFilter /> Filters
          </button>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="flex gap-8">
          {/* FILTERS */}
          <aside
            className={`fixed inset-0 z-40 bg-black/40 lg:bg-transparent lg:static ${
              showFilters ? "block" : "hidden"
            } lg:block`}
          >
            <div className="glass-card glass-panel w-[85%] max-w-sm lg:w-[260px] h-full lg:h-auto rounded-r-2xl lg:rounded-2xl p-5 lg:sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                >
                  <FiX />
                </button>
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search phones"
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 mb-4"
              />

              <div className="space-y-2 mb-4">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setBrand(b);
                      closeFilters();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      brand === b ? "bg-orange-500 text-white" : "bg-white/5"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="space-y-2 mb-4">
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
                        : "bg-white/5"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <button
                onClick={clearAll}
                className="w-full bg-red-500/20 text-red-400 py-2 rounded-lg flex justify-center gap-2"
              >
                <FiTrash2 /> Clear
              </button>
            </div>
          </aside>

          {/* PRODUCTS */}
          <main className="flex-1">
            <h2 className="text-lg font-semibold mb-6 text-gray-300">
              {filteredPhones.length} Phones Available
            </h2>

            {filteredPhones.length === 0 ? (
              <div className="glass-card text-center p-10">No phones found</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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
