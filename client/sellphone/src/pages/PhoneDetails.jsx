import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedPhone,
  clearSelectedPhone,
} from "../redux/slices/selectedPhoneSlice";
import { addToCart } from "../redux/slices/cartSlice";
import toast from "react-hot-toast";

const PhoneDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const phoneList = useSelector((state) => state.phones.list);
  const phone = useSelector((state) => state.selectedPhone.phone);

  useEffect(() => {
    if (!phoneList || phoneList.length === 0) return;

    const foundPhone = phoneList.find(
      (item) => String(item._id) === String(id)
    );

    if (foundPhone) {
      dispatch(setSelectedPhone(foundPhone));
    }

    return () => dispatch(clearSelectedPhone());
  }, [id, phoneList, dispatch]);

  if (!phone) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Phone not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {/* TOP SECTION */}
      <div className="grid md:grid-cols-2 gap-10">
        {/* IMAGE */}
        <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center">
          <img
            src={phone.image}
            alt={phone.model}
            className="h-96 object-contain"
          />
        </div>

        {/* DETAILS */}
        <div className="space-y-5">
          <h1 className="text-3xl font-bold text-gray-800">
            {phone.brand} {phone.model}
          </h1>

          <div className="flex items-center gap-2 text-sm">
            ⭐⭐⭐⭐☆{" "}
            <span className="text-gray-500">(4.3 | 1,200 reviews)</span>
          </div>

          <div className="space-y-2 text-gray-700">
            <p>
              Storage: <strong>{phone.storage}</strong>
            </p>
            <p>
              Condition:{" "}
              <span className="text-green-600 font-medium">
                {phone.condition}
              </span>
            </p>
          </div>

          {/* PRICE */}
          <div className="bg-gray-100 rounded-xl p-5">
            <p className="text-3xl font-bold text-orange-500">₹{phone.price}</p>
            <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              dispatch(addToCart(phone));
              toast.success("Added to cart");
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl text-lg font-semibold transition"
          >
            Add to Cart
          </button>

          {/* TRUST */}
          <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600 pt-4">
            <div>🚚 Free Delivery</div>
            <div>🔁 7-Day Replacement</div>
            <div>🛡️ 6-Month Warranty</div>
          </div>
        </div>
      </div>

      {/* WHY SECTION */}
      <div className="bg-white rounded-2xl border p-8">
        <h2 className="text-xl font-semibold mb-6">Why buy from SalePhone?</h2>

        <ul className="grid md:grid-cols-2 gap-4 text-gray-600">
          <li>✔ 100% verified devices</li>
          <li>✔ Battery health checked</li>
          <li>✔ Certified refurbishment</li>
          <li>✔ Secure payments</li>
        </ul>
      </div>
    </div>
  );
};

export default PhoneDetails;
