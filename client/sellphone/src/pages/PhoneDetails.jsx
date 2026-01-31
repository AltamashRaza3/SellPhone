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

  const phoneList = useSelector((state) =>
    Array.isArray(state.phones?.items) ? state.phones.items : []
  );

  const phone = useSelector((state) => state.selectedPhone.phone);

  useEffect(() => {
    if (!phoneList.length) return;

    const foundPhone = phoneList.find(
      (item) => String(item._id) === String(id)
    );

    if (foundPhone) {
      dispatch(setSelectedPhone(foundPhone));
    }

    return () => {
      dispatch(clearSelectedPhone());
    };
  }, [id, phoneList, dispatch]);

  if (!phone) {
    return (
      
        <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
          Phone not found
        </div>
      
    );
  }

  return (
      <div className="space-y-12">
        {/* ================= TOP ================= */}
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* IMAGE */}
          <div className="glass-card flex items-center justify-center">
            <img
              src={phone.image}
              alt={`${phone.brand} ${phone.model}`}
              className="h-96 object-contain"
            />
          </div>

          {/* DETAILS */}
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-white">
              {phone.brand} {phone.model}
            </h1>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              ⭐⭐⭐⭐☆
              <span>(4.3 · 1,200 reviews)</span>
            </div>

            <div className="space-y-2 text-gray-300">
              <p>
                Storage: <span className="text-white">{phone.storage}</span>
              </p>
              <p>
                Condition:{" "}
                <span className="text-green-400 font-medium">
                  {phone.condition}
                </span>
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
            </div>

            {/* PRICE */}
            <div className="glass-card">
              <p className="text-3xl font-bold text-orange-400">
                ₹{phone.price}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Inclusive of all taxes
              </p>
            </div>

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

            {/* TRUST */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-400 pt-4">
              <div>🚚 Free Delivery</div>
              <div>🔁 7-Day Replacement</div>
              <div>🛡️ 6-Month Warranty</div>
            </div>
          </div>
        </div>

        {/* ================= WHY ================= */}
        <div className="glass-card">
          <h2 className="text-xl font-semibold text-white mb-6">
            Why buy from SalePhone?
          </h2>

          <ul className="grid md:grid-cols-2 gap-4 text-gray-400">
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
