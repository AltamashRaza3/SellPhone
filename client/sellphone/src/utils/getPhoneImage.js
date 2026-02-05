// utils/getPhoneImage.js
import noImage from "../assets/no-image.png";
import API_BASE_URL from "../config/api";

export const getPhoneImage = (phone) => {
  if (
    phone?.images &&
    Array.isArray(phone.images) &&
    phone.images.length > 0
  ) {
    return `${API_BASE_URL}${phone.images[0]}`;
  }

  return noImage;
};
