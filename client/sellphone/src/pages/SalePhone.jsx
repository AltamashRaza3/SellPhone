import { useState } from "react";
import { toast } from "react-hot-toast";

const SalePhone = () => {
  const [form, setForm] = useState({
    brand: "",
    model: "",
    storage: "",
    condition: "",
    price: "",
    contact: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation
    if (Object.values(form).some((v) => !v)) {
      toast.error("Please fill all fields");
      return;
    }

    // For now, just show success
    toast.success("Your phone submission is successful!");
    setForm({
      brand: "",
      model: "",
      storage: "",
      condition: "",
      price: "",
      contact: "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-28 pb-16">
      <h1 className="text-3xl font-bold text-orange-500 mb-6 text-center">
        Sell Your Phone
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="brand"
            placeholder="Brand (e.g., Samsung)"
            value={form.brand}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            type="text"
            name="model"
            placeholder="Model (e.g., Galaxy S21)"
            value={form.model}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            type="text"
            name="storage"
            placeholder="Storage (e.g., 128GB)"
            value={form.storage}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <select
            name="condition"
            value={form.condition}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          >
            <option value="">Select Condition</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Used">Used</option>
            <option value="Refurbished">Refurbished</option>
          </select>
          <input
            type="number"
            name="price"
            placeholder="Expected Price (₹)"
            value={form.price}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            type="text"
            name="contact"
            placeholder="Your Contact Number"
            value={form.contact}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-full font-medium hover:bg-orange-600 transition"
        >
          Submit Phone
        </button>
      </form>

      <p className="mt-6 text-center text-gray-500 text-sm">
        After submitting, our team will contact you to confirm your listing.
      </p>
    </div>
  );
};

export default SalePhone;
