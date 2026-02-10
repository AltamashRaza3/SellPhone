import { useState } from "react";
import { toast } from "react-hot-toast";
import API_BASE_URL from "../../config/api";

const CreateRider = ({ onCreated }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const createRider = async () => {
    if (!name || !phone) {
      toast.error("Name and phone are required");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      toast.error("Enter valid 10-digit phone");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/admin/riders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Rider created");
      setName("");
      setPhone("");
      onCreated?.();
    } catch (err) {
      toast.error(err.message || "Failed to create rider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card space-y-4">
      <h3 className="text-lg font-semibold text-white">Create New Rider</h3>

      <input
        placeholder="Rider Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input w-full"
      />

      <input
        placeholder="Phone Number"
        value={phone}
        maxLength={10}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
        className="input w-full"
      />

      <button
        disabled={loading}
        onClick={createRider}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold disabled:opacity-60"
      >
        {loading ? "Creating…" : "Create Rider"}
      </button>
    </div>
  );
};

export default CreateRider;
