import { useState } from "react";
import { toast } from "react-hot-toast";
import { auth } from "../utils/firebase";

const normalizeRam = (value) => {
  const num = value.replace(/\D/g, "");
  return num ? `${num}GB` : "";
};

const SellPhone = () => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    storage: "",
    ram: "",
    color: "",
    condition: "Good",
    expectedPrice: "",
    phone: "",
    images: "",

    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "ram") {
      setForm({ ...form, ram: normalizeRam(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      toast.error("Please login first");
      return;
    }

    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();

      const imageUrls = form.images
        ? form.images.split(",").map((u) => u.trim())
        : [];

      const res = await fetch("http://localhost:5000/api/sell-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: {
            brand: form.brand,
            model: form.model,
            storage: form.storage,
            ram: form.ram,
            color: form.color,
            condition: form.condition,
            images: imageUrls,
          },
          expectedPrice: Number(form.expectedPrice),
          contact: { phone: form.phone },
          pickupAddress: {
            fullAddress: form.fullAddress,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            landmark: form.landmark,
          },
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Sell request submitted successfully");

      setForm({
        brand: "",
        model: "",
        storage: "",
        ram: "",
        color: "",
        condition: "Good",
        expectedPrice: "",
        phone: "",
        images: "",
        fullAddress: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
      });
    } catch {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appContainer py-12">
      <div className="max-w-3xl mx-auto glass-card space-y-6">
        <h1 className="text-2xl font-bold text-white">Sell Your Phone</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input
            className="input"
            name="brand"
            placeholder="Brand *"
            value={form.brand}
            onChange={handleChange}
          />
          <input
            className="input"
            name="model"
            placeholder="Model *"
            value={form.model}
            onChange={handleChange}
          />
          <input
            className="input"
            name="storage"
            placeholder="Storage"
            value={form.storage}
            onChange={handleChange}
          />
          <input
            className="input"
            name="ram"
            placeholder="RAM (e.g. 8GB)"
            value={form.ram}
            onChange={handleChange}
          />
          <input
            className="input"
            name="color"
            placeholder="Color"
            value={form.color}
            onChange={handleChange}
          />

          <select
            className="input"
            name="condition"
            value={form.condition}
            onChange={handleChange}
          >
            <option>Excellent</option>
            <option>Good</option>
            <option>Fair</option>
          </select>

          <input
            className="input md:col-span-2"
            type="number"
            name="expectedPrice"
            placeholder="Expected Price (₹) *"
            value={form.expectedPrice}
            onChange={handleChange}
          />
          <input
            className="input md:col-span-2"
            name="phone"
            placeholder="WhatsApp Mobile Number *"
            value={form.phone}
            onChange={handleChange}
          />
          <textarea
            className="input md:col-span-2"
            name="images"
            placeholder="Paste image URLs (comma separated)"
            rows={3}
            value={form.images}
            onChange={handleChange}
          />

          <div className="md:col-span-2 text-gray-400 font-semibold">
            Pickup Address
          </div>

          <textarea
            className="input md:col-span-2"
            name="fullAddress"
            placeholder="Full Address *"
            value={form.fullAddress}
            onChange={handleChange}
          />
          <input
            className="input"
            name="city"
            placeholder="City *"
            value={form.city}
            onChange={handleChange}
          />
          <input
            className="input"
            name="state"
            placeholder="State *"
            value={form.state}
            onChange={handleChange}
          />
          <input
            className="input"
            name="pincode"
            placeholder="Pincode *"
            value={form.pincode}
            onChange={handleChange}
          />
          <input
            className="input"
            name="landmark"
            placeholder="Landmark (optional)"
            value={form.landmark}
            onChange={handleChange}
          />

          <button disabled={loading} className="btn-primary md:col-span-2 py-3">
            {loading ? "Submitting..." : "Submit Sell Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellPhone;
