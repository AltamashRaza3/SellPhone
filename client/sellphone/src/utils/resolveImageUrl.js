import API_BASE_URL from "../config/api";

export const resolveImageUrl = (img) => {
  if (!img) return "";

  // If already full external URL
  if (typeof img === "string") {
    return img.startsWith("http")
      ? img
      : `${API_BASE_URL}${img}`;
  }

  // If stored as object with url
  if (typeof img === "object" && img.url) {
    return img.url.startsWith("http")
      ? img.url
      : `${API_BASE_URL}${img.url}`;
  }

  // If stored as object with filename
  if (typeof img === "object" && img.filename) {
    return `${API_BASE_URL}/uploads/${img.filename}`;
  }

  return "";
};
