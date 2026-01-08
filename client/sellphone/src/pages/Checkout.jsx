import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/slices/cartSlice";
import { toast } from "react-hot-toast";

const Checkout = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [placingOrder, setPlacingOrder] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  // ✅ Redirect safely if cart empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart", { replace: true });
    }
  }, [cartItems, navigate]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.phone.price * item.quantity,
    0
  );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleOrder = () => {
    if (placingOrder) return;

    if (Object.values(form).some((v) => !v)) {
      toast.error("Please fill all details");
      return;
    }

    setPlacingOrder(true);

    const order = {
      orderId: `ORD-${Date.now()}`,
      items: cartItems,
      total,
      address: form,
      createdAt: new Date().toISOString(),
    };

    // ✅ Save latest order
    localStorage.setItem("latestOrder", JSON.stringify(order));

    // ✅ Save order history
    const prevOrders = JSON.parse(localStorage.getItem("orders")) || [];
    localStorage.setItem("orders", JSON.stringify([order, ...prevOrders]));

    dispatch(clearCart());

    setTimeout(() => {
      navigate("/order-success", { replace: true });
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-28 pb-16 grid md:grid-cols-2 gap-10">
      {/* Address */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>

        {["name", "phone", "address", "city", "pincode"].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field.toUpperCase()}
            value={form[field]}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-3"
          />
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        {cartItems.map((item) => (
          <div key={item.phone._id} className="flex justify-between mb-2">
            <p>
              {item.phone.brand} {item.phone.model} × {item.quantity}
            </p>
            <p>₹{item.phone.price * item.quantity}</p>
          </div>
        ))}

        <hr className="my-4" />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        <button
          onClick={handleOrder}
          disabled={placingOrder}
          className={`w-full mt-6 py-3 rounded-full font-medium transition
            ${
              placingOrder
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
        >
          {placingOrder ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
