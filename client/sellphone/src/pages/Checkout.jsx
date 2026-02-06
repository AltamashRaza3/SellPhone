import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
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
    name: "",
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
    0,
  );

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= PLACE ORDER ================= */
  const handlePlaceOrder = async () => {
    if (!cartItems.length) {
      toast.error("Your cart is empty");
      return;
    }

    const shippingAddress = {
      name: address.name.trim(),
      phone: address.phone.trim(),
      line1: address.line1.trim(),
      line2: address.line2.trim() || "",
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
    };

    // ✅ FINAL VALIDATION
    if (
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.line1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      toast.error("Please fill all required address fields");
      return;
    }

    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);

    try {
      const items = cartItems.map((item) => ({
        productId: item.phone._id,
        price: item.phone.price,
        quantity: item.quantity || 1,
        ...(item.phone.inventoryId && {
          inventoryId: item.phone.inventoryId,
        }),
      }));

      await axios.post(
        "/orders",
        {
          items,
          totalAmount,
          shippingAddress,
          paymentMethod: "COD",
        },
        { withCredentials: true },
      );

      dispatch(clearCart());
      toast.success("Order placed successfully");
      navigate("/orders");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <div className="space-y-10">
        <h1 className="text-3xl font-semibold text-white">Checkout</h1>

        <div className="glass-card space-y-4">
          <h2 className="text-lg font-medium text-white">Delivery Address</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Full Name *"
              value={address.name}
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
