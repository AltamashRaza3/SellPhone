import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { clearCart } from "../redux/slices/cartSlice";
import axios from "../utils/axios";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ================= REDUX ================= */
  const cartItems = useSelector((state) => state.cart.items);

  /* ================= LOCAL STATE ================= */
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

  /* ================= TOTAL ================= */
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.phone.price * item.quantity,
    0
  );

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setAddress((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
      const shippingAddress = `
${address.fullName}, ${address.phone}
${address.line1}${address.line2 ? ", " + address.line2 : ""}
${address.city}, ${address.state} - ${address.pincode}
      `.trim();

      const payload = {
        items: cartItems.map((item) => ({
          phone: item.phone, // REQUIRED by schema
          quantity: item.quantity,
        })),
        totalAmount,
        shippingAddress,
        paymentMethod: "COD",
      };

      /* ================= CREATE ORDER ================= */
      await axios.post("/orders", payload);

      /* ================= CLEAR BACKEND CART ================= */
      await axios.delete(`/cart/${auth.currentUser.uid}`);

      /* ================= CLEAR REDUX CART ================= */
      dispatch(clearCart());

      toast.success("Order placed successfully");
      navigate("/orders");
    } catch (error) {
      console.error("❌ Order placement error:", error);
      toast.error(error?.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>

      {/* ADDRESS */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Delivery Address</h2>

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
          className="input"
        />
        <input
          name="line2"
          placeholder="Landmark (Optional)"
          value={address.line2}
          onChange={handleChange}
          className="input"
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

      {/* SUMMARY */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item.phone._id} className="flex justify-between text-sm">
            <span>
              {item.phone.brand} {item.phone.model} × {item.quantity}
            </span>
            <span>₹{item.phone.price * item.quantity}</span>
          </div>
        ))}
        <hr />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{totalAmount}</span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
      >
        {loading ? "Placing Order..." : "Place Order (Cash on Delivery)"}
      </button>
    </div>
  );
};

export default Checkout;
