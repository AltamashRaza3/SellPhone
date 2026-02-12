import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect, useMemo } from "react";
import PhoneCard from "../components/PhoneCard";

const Phones = () => {
  const phones = useSelector((state) =>
    Array.isArray(state?.phones?.items) ? state.phones.items : [],
  );

  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState(params.get("search") || "");
  const [brand, setBrand] = useState(params.get("brand") || "All");
  const [price, setPrice] = useState(params.get("price") || "All");
  const [sort, setSort] = useState(params.get("sort") || "Default");

  /* ================= BRANDS ================= */
  const brands = useMemo(
    () => ["All", ...new Set(phones.map((p) => p?.brand).filter(Boolean))],
    [phones],
  );

  /* ================= URL SYNC ================= */
  useEffect(() => {
    const q = {};
    if (search) q.search = search;
    if (brand !== "All") q.brand = brand;
    if (price !== "All") q.price = price;
    if (sort !== "Default") q.sort = sort;

    setParams(q, { replace: true });
  }, [search, brand, price, sort, setParams]);

  /* ================= FILTER + SORT ================= */
  const filteredPhones = useMemo(() => {
    let result = phones.filter((p) => {
      const text = `${p?.brand} ${p?.model}`.toLowerCase();
      const priceNum = Number(p?.price) || 0;

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesBrand = brand === "All" || p?.brand === brand;

      const matchesPrice =
        price === "All" ||
        (price === "0-10000" && priceNum <= 10000) ||
        (price === "10001-30000" && priceNum >= 10001 && priceNum <= 30000) ||
        (price === "30001-50000" && priceNum >= 30001 && priceNum <= 50000) ||
        (price === "50000+" && priceNum > 50000);

      return matchesSearch && matchesBrand && matchesPrice;
    });

    /* ===== SORT ===== */
    if (sort === "PriceLow") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "PriceHigh") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "Newest") {
      result.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    }

    return result;
  }, [phones, search, brand, price, sort]);

  const hasActiveFilters =
    search || brand !== "All" || price !== "All" || sort !== "Default";

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-24">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-6xl px-6 flex flex-col items-center">
          {/* ================= HERO ================= */}
          <section className="text-center space-y-6 mb-20">
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-gray-900">
              Premium Smartphones.
            </h1>

            <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
              Buy certified refurbished devices with confidence. Tested,
              verified, and ready for delivery.
            </p>
          </section>

          {/* ================= FILTER PANEL ================= */}
          <div className="w-full max-w-5xl mb-24">
            <div className="bg-white rounded-[40px] shadow-[0_20px_80px_rgba(0,0,0,0.06)] px-10 py-10 space-y-10 border border-gray-100">
              {/* TOP ROW */}
              <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                {/* SEARCH */}
                <div className="relative w-full lg:max-w-md">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                  </div>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by brand or model"
                    className="w-full bg-[#f2f2f4] rounded-full pl-12 pr-6 py-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                  />
                </div>

                {/* SORT */}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-[#f2f2f4] rounded-full px-6 py-3.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                >
                  <option value="Default">Sort By</option>
                  <option value="PriceLow">Price: Low to High</option>
                  <option value="PriceHigh">Price: High to Low</option>
                  <option value="Newest">Newest</option>
                </select>

                {/* PRICE */}
                <select
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-[#f2f2f4] rounded-full px-6 py-3.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                >
                  <option value="All">All Prices</option>
                  <option value="0-10000">Below ₹10K</option>
                  <option value="10001-30000">₹10K – ₹30K</option>
                  <option value="30001-50000">₹30K – ₹50K</option>
                  <option value="50000+">Above ₹50K</option>
                </select>
              </div>

              {/* BRAND FILTERS */}
              <div className="flex flex-wrap justify-center gap-3">
                {brands.map((b) => {
                  const isActive = brand === b;

                  return (
                    <button
                      key={b}
                      onClick={() => setBrand(b)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-black text-white shadow-md scale-[1.03]"
                          : "bg-[#f2f2f4] text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>

              {/* CLEAR FILTERS */}
              {hasActiveFilters && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setSearch("");
                      setBrand("All");
                      setPrice("All");
                      setSort("Default");
                    }}
                    className="text-sm text-gray-500 hover:text-black transition underline underline-offset-4"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ================= COUNT ================= */}
          <div className="w-full mb-12 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              {filteredPhones.length} Devices Available
            </p>
          </div>

          {/* ================= GRID ================= */}
          {filteredPhones.length === 0 ? (
            <div className="w-full max-w-4xl bg-white rounded-3xl py-24 text-center shadow-sm">
              <p className="text-gray-500">No phones found.</p>
            </div>
          ) : (
            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
              {filteredPhones.map((phone) => (
                <PhoneCard key={phone._id} phone={phone} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Phones;
