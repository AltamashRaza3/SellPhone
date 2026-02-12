import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedPhone,
  clearSelectedPhone,
} from "../redux/slices/selectedPhoneSlice";
import { addToCart } from "../redux/slices/cartSlice";
import toast from "react-hot-toast";
import noImage from "../assets/no-image.png";
import { resolveImageUrl } from "../utils/resolveImageUrl";

/* ================= UTIL ================= */
const normalize = (val) => val?.toString().replace(/\s+/g, "").toLowerCase();

const PhoneDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const phoneList = useSelector((state) =>
    Array.isArray(state.phones?.items) ? state.phones.items : [],
  );

  const phone = useSelector((state) => state.selectedPhone.phone);

  const [activeImage, setActiveImage] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  /* ================= LOAD PHONE ================= */
  useEffect(() => {
    if (!phoneList.length) return;

    const found = phoneList.find((item) => String(item._id) === String(id));

    if (found) {
      dispatch(setSelectedPhone(found));
      setActiveImage(found.images?.[0] || null);
    }

    return () => dispatch(clearSelectedPhone());
  }, [id, phoneList, dispatch]);

  /* ================= STICKY BAR ================= */
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= VARIANTS ================= */
  const variants = useMemo(() => {
    if (!phone) return [];
    return phoneList.filter(
      (item) =>
        item.brand === phone.brand &&
        item.model === phone.model &&
        item.status === "Published",
    );
  }, [phone, phoneList]);

  const storageOptions = [
    ...new Set(variants.map((v) => normalize(v.storage))),
  ];

  const colorOptions = [...new Set(variants.map((v) => normalize(v.color)))];

  /* ================= VARIANT SWITCH ================= */
  const navigateToVariant = (field, value) => {
    if (!phone) return;

    const match = variants.find((v) => {
      const sameStorage =
        field === "storage"
          ? normalize(v.storage) === value
          : normalize(v.storage) === normalize(phone.storage);

      const sameColor =
        field === "color"
          ? normalize(v.color) === value
          : normalize(v.color) === normalize(phone.color);

      return sameStorage && sameColor;
    });

    if (match && match._id !== phone._id) {
      navigate(`/phone/${match._id}`);
    }
  };

  if (!phone) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Phone not found
      </div>
    );
  }

  const images = Array.isArray(phone.images) ? phone.images : [];
  const discountPrice = Math.round(phone.price * 1.15);

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* ================= IMAGE ================= */}
          <div className="space-y-6">
            <div className="bg-white rounded-[40px] p-16 shadow-sm flex justify-center">
              <img
                src={activeImage ? resolveImageUrl(activeImage) : noImage}
                className="max-h-[420px] object-contain"
                onError={(e) => (e.currentTarget.src = noImage)}
                alt=""
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-4 justify-center">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 rounded-2xl overflow-hidden transition ${
                      activeImage === img
                        ? "ring-2 ring-black/20"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={resolveImageUrl(img)}
                      className="h-full w-full object-contain"
                      onError={(e) => (e.currentTarget.src = noImage)}
                      alt=""
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= INFO ================= */}
          <div className="space-y-10">
            {/* TITLE */}
            <div>
              <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
                {phone.brand} {phone.model}
              </h1>
              <p className="text-lg text-gray-500 mt-3">
                {phone.storage} • {phone.ram} • {phone.color}
              </p>
            </div>

            {/* STORAGE */}
            {storageOptions.length > 1 && (
              <div>
                <p className="text-sm text-gray-500 mb-3">Storage</p>
                <div className="flex gap-3 flex-wrap">
                  {storageOptions.map((storage) => (
                    <button
                      key={storage}
                      onClick={() => navigateToVariant("storage", storage)}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                        normalize(phone.storage) === storage
                          ? "bg-black text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {storage.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* COLOR */}
            {colorOptions.length > 1 && (
              <div>
                <p className="text-sm text-gray-500 mb-3">Color</p>
                <div className="flex gap-4">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => navigateToVariant("color", color)}
                      className={`h-8 w-8 rounded-full border-2 transition ${
                        normalize(phone.color) === color
                          ? "border-black scale-110"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* PRICE */}
            <div>
              <div className="flex items-center gap-4">
                <p className="text-4xl font-semibold text-gray-900">
                  ₹{Number(phone.price).toLocaleString("en-IN")}
                </p>
                <p className="text-lg text-gray-400 line-through">
                  ₹{discountPrice.toLocaleString("en-IN")}
                </p>
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                  15% OFF
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                EMI from ₹{Math.round(phone.price / 12)} / month
              </p>

              {phone.stock > 0 && phone.stock <= 3 && (
                <p className="text-sm text-red-600 mt-2">
                  Only {phone.stock} left in stock
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <button
                disabled={phone.stock === 0}
                onClick={() => {
                  dispatch(addToCart(phone));
                  toast.success("Added to cart");
                }}
                className="w-full py-4 rounded-full text-lg font-medium bg-black text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {phone.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              <button
                disabled={phone.stock === 0}
                onClick={() => {
                  dispatch(addToCart(phone));
                  navigate("/checkout");
                }}
                className="w-full py-4 rounded-full border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50"
              >
                {phone.stock === 0 ? "Out of Stock" : "Buy Now"}
              </button>
            </div>

            {/* TRUST */}
            <div className="pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
              <p>🚚 Free delivery in 2–4 business days</p>
              <p>🛡 6 Month Warranty</p>
              <p>🔄 7-Day Replacement Guarantee</p>
              <p>🔒 Secure Payments</p>
            </div>

            {/* SPECS */}
            <div className="pt-6 border-t border-gray-200 space-y-3">
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className="font-medium">{phone.condition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Accessories</p>
                <p className="font-medium">Charger Included</p>
              </div>
            </div>

            {/* DESCRIPTION */}
            {phone.description && (
              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold mb-4">
                  About this device
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {phone.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= STICKY BAR ================= */}
      <div
        className={`fixed bottom-0 left-0 w-full z-50 transition-all duration-500 ${
          showStickyBar
            ? "translate-y-0 opacity-100"
            : "translate-y-6 opacity-0 pointer-events-none"
        }`}
      >
        <div className="backdrop-blur-xl bg-white/80 border-t border-gray-200 shadow-[0_-8px_40px_rgba(0,0,0,0.06)]">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {phone.storage} • {phone.ram} • {phone.color}
              </p>
              <p className="font-semibold">
                ₹{Number(phone.price).toLocaleString("en-IN")}
              </p>
            </div>

            <button
              disabled={phone.stock === 0}
              onClick={() => {
                dispatch(addToCart(phone));
                toast.success("Added to cart");
              }}
              className="px-8 py-3 rounded-full bg-black text-white text-sm hover:opacity-90 disabled:opacity-50"
            >
              {phone.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneDetails;
