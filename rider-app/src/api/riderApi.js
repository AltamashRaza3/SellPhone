import axios from "axios";
import API_BASE_URL from "../config/api";

const riderApi = axios.create({
  baseURL: `${API_BASE_URL}/api/rider`,
  withCredentials: true,
});

/* ================= AUTH INTERCEPTOR ================= */
riderApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("riderToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔥 IMPORTANT: never manually set multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default riderApi;
