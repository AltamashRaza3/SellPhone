import axios from "axios";

const riderApi = axios.create({
  baseURL: "http://localhost:5000/api/rider",
  withCredentials: false,
});

/* ================= AUTH + FORM DATA FIX ================= */
riderApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("riderToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default riderApi;
