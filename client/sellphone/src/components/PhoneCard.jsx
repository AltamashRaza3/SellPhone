import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const PhoneCard = ({ phone }) => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  if (!phone || !phone._id) return null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    dispatch(addToCart(phone));
    toast.success("Added to cart");
  };

  return (
    <Link to={`/phone/${phone._id}`} className="block h-full">
      <div className="glass-card h-full flex flex-col transition hover:shadow-xl">
        {/* IMAGE */}
        <div className="h-40 flex items-center justify-center mb-4">
          <img
            src={phone.image}
            alt={phone.model}
            className="max-h-full object-contain"
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
            ₹{phone.price}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={!user}
          className={`mt-4 w-full py-2 rounded-lg font-medium transition
            ${
              user
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
        >
          {user ? "Add to Cart" : "Login to Add"}
        </button>
      </div>
    </Link>
  );
};

export default PhoneCard;
