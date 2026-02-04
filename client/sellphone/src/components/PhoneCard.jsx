import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import noImage from "../assets/no-image.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PhoneCard = ({ phone }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.user);

  if (!phone || !phone._id) return null;

  /* ================= IMAGE RESOLUTION ================= */
  let imageSrc = noImage;

  if (Array.isArray(phone.images) && phone.images.length > 0) {
    const img = phone.images[0];
    imageSrc = img.startsWith("http") ? img : `${API_BASE_URL}${img}`;
  } else if (typeof phone.image === "string") {
    imageSrc = phone.image;
  }

  /* ================= ADD TO CART ================= */
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(addToCart(phone));

    if (!user) {
      toast("Added to cart. Login at checkout to continue.", {
        icon: "🛒",
      });
    } else {
      toast.success("Added to cart");
    }
  };

  return (
    <Link to={`/phone/${phone._id}`} className="block h-full">
      <div className="glass-card h-full flex flex-col hover:shadow-xl transition">
        {/* IMAGE */}
        <div className="h-40 flex items-center justify-center mb-4 overflow-hidden">
          <img
            src={imageSrc}
            alt={`${phone.brand} ${phone.model}`}
            className="max-h-full object-contain"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = noImage;
            }}
          />
        </div>

        {/* INFO */}
        <div className="flex-1 text-center">
          <h3 className="font-semibold leading-snug">
            {phone.brand} {phone.model}
          </h3>

          <p className="text-sm text-gray-400 mt-1">
            {phone.storage} • {phone.condition}
          </p>

          <p className="text-xl font-bold text-orange-500 mt-3">
            ₹{Number(phone.price).toLocaleString("en-IN")}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          className="mt-4 w-full py-2 rounded-lg font-medium bg-orange-500 hover:bg-orange-600 text-white transition"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default PhoneCard;
