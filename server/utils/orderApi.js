import API_BASE_URL from "../config/api";

const API = `${API_BASE_URL}/api/orders`;

/* ================= USER ================= */
export const createOrder = async (payload) => {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Order creation failed");
  return res.json();
};

export const getMyOrders = async (userId) => {
  const res = await fetch(`${API}/my?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};

/* ================= ADMIN ================= */
export const getAllOrders = async () => {
  const res = await fetch(API, {
    credentials: "include", // 🔥 admin cookie
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
};

export const updateOrderStatus = async (id, status) => {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Update failed");
  return res.json();
};
