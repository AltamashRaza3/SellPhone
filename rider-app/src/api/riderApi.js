import axios from "axios";

const riderApi = axios.create({
  baseURL: "http://localhost:5000/api/rider",
});

/* ================= AUTH INTERCEPTOR ================= */
riderApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("riderToken");

    if (!token) {
      throw new Error("Rider token missing");
    }

    // 🔐 THIS IS THE FIX
    config.headers.Authorization = `Bearer ${token}`;

    // 🔥 IMPORTANT: never manually set multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default riderApi;
