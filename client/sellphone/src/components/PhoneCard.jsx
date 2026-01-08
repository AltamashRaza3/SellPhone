import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const PhoneCard = ({ phone }) => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    // Prevent navigating to details when clicking Add to Cart
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    dispatch(addToCart(phone));
    toast.success("Added to cart 🛒");
  };

  return (
    <Link to={`/phone/${phone._id}`} className="block">
      <div className="border rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer">
        <img
          src={phone.image}
          alt={phone.model}
          className="w-full h-40 object-contain"
        />

        <h3 className="font-semibold mt-2">
          {phone.brand} {phone.model}
        </h3>

        <p className="text-gray-600">₹{phone.price}</p>

        {/* ADD TO CART */}
        <button
          onClick={handleAddToCart}
          disabled={!user}
          className={`mt-3 w-full py-2 rounded-lg font-medium transition
            ${
              user
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {user ? "Add to Cart" : "Login to Add"}
        </button>
      </div>
    </Link>
  );
};

export default PhoneCard;
