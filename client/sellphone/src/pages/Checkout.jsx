import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { clearCart } from "../redux/slices/cartSlice";
import axios from "../utils/axios";
import AppContainer from "../components/AppContainer";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.items);

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  /* ================= TOTAL (DISPLAY ONLY) ================= */
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.phone.price * item.quantity,
    0,
  );

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    setAddress((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================= VALIDATION ================= */
  const validateAddress = () => {
    const { fullName, phone, line1, city, state, pincode } = address;

    if (!fullName || !phone || !line1 || !city || !state || !pincode) {
      toast.error("Please fill all required address fields");
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      toast.error("Enter a valid 10-digit phone number");
      return false;
    }

    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return false;
    }

    return true;
  };

  /* ================= PLACE ORDER ================= */
  const handlePlaceOrder = async () => {
    if (!cartItems.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (!validateAddress()) return;

    setLoading(true);

    try {
      const payload = {
        items: cartItems.map((item) => ({
          inventoryId: item.phone.inventoryId || null, // if exists
          phoneId: item.phone._id,
          quantity: item.quantity,
          price: item.phone.price,
        })),
        totalAmount, // ✅ REQUIRED
        shippingAddress: {
          name: address.fullName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        paymentMethod: "COD",
      };

      await axios.post("/orders", payload, {
        withCredentials: true, // 🔥 REQUIRED (userAuth)
      });

      dispatch(clearCart());

      if (auth.currentUser?.uid) {
        await axios.delete(`/cart/${auth.currentUser.uid}`, {
          withCredentials: true,
        });
      }

      toast.success("Order placed successfully");
      navigate("/orders");
    } catch (error) {
      console.error("ORDER ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <div className="space-y-10">
        <h1 className="text-3xl font-semibold text-white">Checkout</h1>

        {/* ================= ADDRESS ================= */}
        <div className="glass-card space-y-4">
          <h2 className="text-lg font-medium text-white">Delivery Address</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="fullName"
              placeholder="Full Name *"
              value={address.fullName}
              onChange={handleChange}
              className="input"
            />
            <input
              name="phone"
              placeholder="Phone Number *"
              value={address.phone}
              onChange={handleChange}
              className="input"
            />
          </div>

          <input
            name="line1"
            placeholder="House No, Street, Area *"
            value={address.line1}
            onChange={handleChange}
            className="input w-full"
          />

          <input
            name="line2"
            placeholder="Landmark (Optional)"
            value={address.line2}
            onChange={handleChange}
            className="input w-full"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="city"
              placeholder="City *"
              value={address.city}
              onChange={handleChange}
              className="input"
            />
            <input
              name="state"
              placeholder="State *"
              value={address.state}
              onChange={handleChange}
              className="input"
            />
            <input
              name="pincode"
              placeholder="Pincode *"
              value={address.pincode}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="glass-card space-y-4">
          <h2 className="text-lg font-medium text-white">Order Summary</h2>

          {cartItems.map((item) => (
            <div
              key={item.phone._id}
              className="flex justify-between text-sm text-gray-300"
            >
              <span>
                {item.phone.brand} {item.phone.model} × {item.quantity}
              </span>
              <span>₹{item.phone.price * item.quantity}</span>
            </div>
          ))}

          <hr className="border-white/10" />

          <div className="flex justify-between text-lg font-semibold text-white">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        {/* ================= CTA ================= */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="btn-primary w-full py-4 text-base disabled:opacity-50"
        >
          {loading ? "Placing Order..." : "Place Order (Cash on Delivery)"}
        </button>
      </div>
    </AppContainer>
  );
};

export default Checkout;
