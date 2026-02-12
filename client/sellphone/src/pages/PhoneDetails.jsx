import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedPhone,
  clearSelectedPhone,
} from "../redux/slices/selectedPhoneSlice";
import { addToCart } from "../redux/slices/cartSlice";
import toast from "react-hot-toast";
import noImage from "../assets/no-image.png";
import { resolveImageUrl } from "../utils/resolveImageUrl";

const PhoneDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const phoneList = useSelector((state) =>
    Array.isArray(state.phones?.items) ? state.phones.items : [],
  );

  const phone = useSelector((state) => state.selectedPhone.phone);
  const [activeImage, setActiveImage] = useState(null);

  /* ================= LOAD PHONE ================= */
  useEffect(() => {
    if (!phoneList.length) return;

    const foundPhone = phoneList.find(
      (item) => String(item._id) === String(id),
    );

    if (foundPhone) {
      dispatch(setSelectedPhone(foundPhone));
      setActiveImage(foundPhone.images?.[0] || null);
    }

    return () => dispatch(clearSelectedPhone());
  }, [id, phoneList, dispatch]);

  if (!phone) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Phone not found
      </div>
    );
  }

  const images = Array.isArray(phone.images) ? phone.images : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid lg:grid-cols-2 gap-20">
        {/* ================= IMAGE SECTION ================= */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 p-10 flex items-center justify-center min-h-[500px]">
            <img
              src={activeImage ? resolveImageUrl(activeImage) : noImage}
              alt={`${phone.brand} ${phone.model}`}
              className="max-h-[420px] object-contain"
              onError={(e) => (e.currentTarget.src = noImage)}
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-4 justify-center flex-wrap">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`p-2 rounded-xl border transition ${
                    activeImage === img
                      ? "border-black ring-2 ring-black/10"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={resolveImageUrl(img)}
                    className="h-16 w-16 object-contain"
                    onError={(e) => (e.currentTarget.src = noImage)}
                    alt=""
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= PRODUCT INFO ================= */}
        <div className="space-y-10">
          {/* TITLE */}
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
              {phone.brand} {phone.model}
            </h1>

            <p className="text-gray-500 text-base">
              {phone.storage}
              {phone.ram && ` • ${phone.ram}`}
              {phone.color && ` • ${phone.color}`}
            </p>
          </div>

          {/* TRUST BADGES */}
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              Verified Device
            </span>
            <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              Professionally Refurbished
            </span>
            <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              Warranty Included
            </span>
          </div>

          {/* CONDITION */}
          <div>
            <p className="text-sm text-gray-500">Condition</p>
            <p className="text-lg font-medium text-gray-900 mt-1">
              {phone.condition}
            </p>
          </div>

          {/* PRICE + CTA CARD */}
          <div className="sticky top-28 bg-white rounded-3xl border border-gray-100 p-8 space-y-6">
            <div>
              <p className="text-4xl font-semibold text-gray-900">
                ₹{Number(phone.price).toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Inclusive of all taxes
              </p>
            </div>

            <button
              onClick={() => {
                dispatch(addToCart(phone));
                toast.success("Added to cart");
              }}
              className="w-full py-4 rounded-full text-base font-medium bg-black text-white hover:opacity-90 transition"
            >
              Add to Cart
            </button>

            <p className="text-xs text-gray-400 text-center">
              Secure checkout. Fast delivery across India.
            </p>
          </div>

          {/* DESCRIPTION */}
          {phone.description && (
            <div className="pt-8 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                About this device
              </h2>
              <p className="text-gray-600 leading-relaxed text-base">
                {phone.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneDetails;
