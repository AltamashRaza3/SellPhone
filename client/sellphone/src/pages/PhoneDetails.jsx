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

import API_BASE_URL from "../utils/api";


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

  const resolveImage = (img) =>
    img?.startsWith("http") ? img : `${API_BASE_URL}${img}`;

  return (
    <div className="space-y-14">
      {/* ================= TOP ================= */}
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* ================= IMAGE GALLERY ================= */}
        <div className="glass-card flex flex-col items-center">
          {/* MAIN IMAGE */}
          <div className="flex items-center justify-center w-full min-h-[420px]">
            <img
              src={activeImage ? resolveImage(activeImage) : noImage}
              alt={`${phone.brand} ${phone.model}`}
              className="max-h-[380px] object-contain"
              onError={(e) => (e.currentTarget.src = noImage)}
            />
          </div>

          {/* THUMBNAILS */}
          {images.length > 1 && (
            <div className="flex gap-4 mt-6">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={resolveImage(img)}
                  onClick={() => setActiveImage(img)}
                  className={`h-20 w-20 object-contain rounded-lg cursor-pointer border transition
                    ${
                      activeImage === img
                        ? "border-orange-500 ring-2 ring-orange-500/30"
                        : "border-zinc-700 hover:border-zinc-500"
                    }`}
                  onError={(e) => (e.currentTarget.src = noImage)}
                  alt=""
                />
              ))}
            </div>
          )}
        </div>

        {/* ================= DETAILS ================= */}
        <div className="space-y-8 pl-2 lg:pl-8">
          {/* TITLE */}
          <h1 className="text-3xl font-semibold text-white">
            {phone.brand} {phone.model}
          </h1>

          {/* SPECS */}
          <div className="space-y-2 text-gray-300">
            <p>
              Storage: <span className="text-white">{phone.storage}</span>
            </p>
            {phone.ram && (
              <p>
                RAM: <span className="text-white">{phone.ram}</span>
              </p>
            )}
            {phone.color && (
              <p>
                Color: <span className="text-white">{phone.color}</span>
              </p>
            )}
            <p>
              Condition:{" "}
              <span className="text-green-400 font-medium">
                {phone.condition}
              </span>
            </p>
          </div>

          {/* TRUST BADGES */}
          <div className="flex flex-wrap gap-3 pt-1">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
              ✅ Verified Device
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              🔁 Refurbished & Tested
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              🛡️ Warranty Included
            </span>
          </div>

          {/* PRICE */}
          <div className="glass-card">
            <p className="text-3xl font-bold text-orange-400">₹{phone.price}</p>
            <p className="text-sm text-gray-400 mt-1">Inclusive of all taxes</p>
          </div>

          {/* DESCRIPTION */}
          {phone.description && (
            <div className="glass-card">
              <h2 className="text-lg font-semibold text-white mb-3">
                Product Description
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {phone.description}
              </p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => {
              dispatch(addToCart(phone));
              toast.success("Added to cart");
            }}
            className="btn-primary w-full py-4 text-lg"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneDetails;
