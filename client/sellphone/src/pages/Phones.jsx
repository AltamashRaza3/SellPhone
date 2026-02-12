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
    setParams(q, { replace: true });
  }, [search, brand, price, setParams]);

  /* ================= FILTER LOGIC ================= */
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

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-6 pb-28">
      {/* ================= HERO ================= */}
      <section className="pt-24 pb-14 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
          Premium Smartphones.
        </h1>

        <p className="text-gray-500 text-lg mt-6 max-w-xl mx-auto leading-relaxed">
          Buy certified refurbished devices with confidence. Tested, verified,
          and ready for delivery.
        </p>
      </section>

      {/* ================= FILTER CONTAINER ================= */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-16 shadow-sm">
        {/* SEARCH + PRICE ROW */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6">
          {/* SEARCH */}
          <div className="relative w-full md:w-96">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phones..."
              className="
              w-full
              bg-gray-50
              border border-gray-200
              rounded-full
              px-5 py-2.5
              text-sm
              text-gray-700
              focus:outline-none
              focus:ring-2 focus:ring-black/10
              transition
            "
            />
          </div>

          {/* PRICE FILTER */}
          <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="
            bg-gray-50
            border border-gray-200
            rounded-full
            px-4 py-2.5
            text-sm
            text-gray-700
            focus:outline-none
            focus:ring-2 focus:ring-black/10
            transition
          "
          >
            <option value="All">All Prices</option>
            <option value="0-10000">Below ₹10K</option>
            <option value="10001-30000">₹10K – ₹30K</option>
            <option value="30001-50000">₹30K – ₹50K</option>
            <option value="50000+">Above ₹50K</option>
          </select>
        </div>

        {/* BRAND FILTERS */}
        <div className="flex flex-wrap gap-3">
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                brand === b
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* ================= COUNT ================= */}
      <div className="mb-10">
        <p className="text-sm text-gray-400 uppercase tracking-wide">
          {filteredPhones.length} Phones Available
        </p>
      </div>

      {/* ================= GRID ================= */}
      {filteredPhones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-24">
          <p className="text-gray-500">No phones found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredPhones.map((phone) => (
            <PhoneCard key={phone._id} phone={phone} />
          ))}
        </div>
      )}
    </div>
  );

};

export default Phones;
