import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import noImage from "../assets/no-image.png";
import { resolveImageUrl } from "../utils/resolveImageUrl";

const PhoneCard = ({ phone }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.user);

  if (!phone || !phone._id) return null;

  const imageSrc = resolveImageUrl(phone.images?.[0] || phone.image) || noImage;

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
    <Link to={`/phone/${phone._id}`} className="group block h-full">
      <div
        className="bg-white rounded-2xl p-5
        border border-gray-100
        shadow-sm
        transition-all duration-300
        hover:shadow-lg hover:-translate-y-1
        flex flex-col h-full"
      >
        {/* IMAGE */}
        <div className="h-40 flex items-center justify-center mb-5">
          <img
            src={imageSrc}
            alt={`${phone.brand} ${phone.model}`}
            className="max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = noImage;
            }}
          />
        </div>

        {/* INFO */}
        <div className="flex-1 text-center">
          <h3 className="text-base font-semibold text-gray-900">
            {phone.brand} {phone.model}
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            {phone.storage} • {phone.condition}
          </p>

          <p className="text-lg font-semibold text-gray-900 mt-3">
            ₹{Number(phone.price).toLocaleString("en-IN")}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          className="mt-4 w-full py-2.5 rounded-full text-sm font-medium
          bg-black text-white
          transition-all duration-300
          hover:opacity-90"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default PhoneCard;
