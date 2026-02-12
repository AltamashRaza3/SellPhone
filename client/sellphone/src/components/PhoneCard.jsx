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

  const price = Number(phone.price) || 0;
  const originalPrice = Number(phone.originalPrice) || null;

  const hasDiscount = originalPrice && originalPrice > price;

  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const inStock = phone.stock === undefined || phone.stock > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) {
      toast.error("This product is out of stock");
      return;
    }

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
        className="
          relative
          bg-white
          rounded-[28px]
          p-6
          border border-gray-100
          shadow-[0_10px_40px_rgba(0,0,0,0.04)]
          transition-all duration-500
          hover:shadow-[0_25px_70px_rgba(0,0,0,0.08)]
          hover:-translate-y-1
          flex flex-col h-full
        "
      >
        {/* DISCOUNT BADGE (REAL ONLY) */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 text-[10px] font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
            {discountPercent}% OFF
          </div>
        )}

        {/* IMAGE */}
        <div className="h-44 flex items-center justify-center mb-6">
          <img
            src={imageSrc}
            alt={`${phone.brand} ${phone.model}`}
            className="
              max-h-full object-contain
              transition-all duration-500
              group-hover:scale-105
            "
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = noImage;
            }}
          />
        </div>

        {/* INFO */}
        <div className="flex-1 text-center space-y-2">
          <h3 className="text-[15px] font-semibold text-gray-900 tracking-tight">
            {phone.brand} {phone.model}
          </h3>

          <p className="text-xs text-gray-500">
            {phone.storage}
            {phone.ram && ` • ${phone.ram}`}
            {phone.condition && ` • ${phone.condition}`}
          </p>

          {/* PRICE */}
          <div className="pt-3 space-y-1">
            <p className="text-lg font-semibold text-gray-900">
              ₹{price.toLocaleString("en-IN")}
            </p>

            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through">
                ₹{originalPrice.toLocaleString("en-IN")}
              </p>
            )}
          </div>

          {/* STOCK STATUS */}
          {phone.stock !== undefined && (
            <>
              {phone.stock === 0 && (
                <p className="text-xs text-red-500 pt-1">Out of Stock</p>
              )}

              {phone.stock > 0 && phone.stock <= 3 && (
                <p className="text-xs text-orange-500 pt-1">
                  Only {phone.stock} left
                </p>
              )}
            </>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`
            mt-6
            w-full
            py-3
            rounded-full
            text-sm
            font-medium
            transition-all duration-300
            ${
              inStock
                ? "bg-black text-white hover:scale-[1.02] active:scale-[0.98]"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {inStock ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </Link>
  );
};

export default PhoneCard;
