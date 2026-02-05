import API_BASE_URL from "../config/api";

export const resolveImageUrl = (img) => {
  if (!img) return "";

  // Already a full external URL
  if (typeof img === "string" && img.startsWith("http")) {
    return img;
  }

  // Relative path from backend
  return `${API_BASE_URL}${img}`;
};
