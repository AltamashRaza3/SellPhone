import axios from "axios";
import { auth } from "./firebase";
import API_BASE_URL from "../config/api";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken(true);
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
