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

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.phone.price * item.quantity,
    0,
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

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

    if (
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.line1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error("Enter valid 10-digit phone number");
      return;
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error("Enter valid 6-digit pincode");
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

      const res = await axios.post(
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
      navigate(`/order-success/${res.data._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        {/* HEADER */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
            Checkout
          </h1>
          <p className="text-gray-500 mt-3">Complete your purchase securely</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-16">
          {/* ================= LEFT: ADDRESS FORM ================= */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white border border-gray-100 rounded-3xl p-10 space-y-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Delivery Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
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
                className="input"
              />

              <input
                name="line2"
                placeholder="Landmark (Optional)"
                value={address.line2}
                onChange={handleChange}
                className="input"
              />

              <div className="grid md:grid-cols-3 gap-6">
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
          </div>

          {/* ================= RIGHT: SUMMARY ================= */}
          <div className="bg-white border border-gray-100 rounded-3xl p-10 space-y-8 h-fit sticky top-28">
            <h2 className="text-xl font-semibold text-gray-900">
              Order Summary
            </h2>

            <div className="space-y-4 text-sm text-gray-600">
              {cartItems.map((item) => (
                <div key={item.phone._id} className="flex justify-between">
                  <span>
                    {item.phone.brand} {item.phone.model} × {item.quantity}
                  </span>
                  <span>
                    ₹
                    {(item.phone.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6 flex justify-between text-lg font-semibold text-gray-900">
              <span>Total</span>
              <span>₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-4 rounded-full bg-black text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Placing Order..." : "Place Order (Cash on Delivery)"}
            </button>
          </div>
        </div>
      </div>
    </AppContainer>
  );
};

export default Checkout;
