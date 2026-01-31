// utils/getPhoneImage.js
import noImage from "../assets/no-image.png";

export const getPhoneImage = (phone, API_BASE_URL) => {
  if (
    phone?.images &&
    Array.isArray(phone.images) &&
    phone.images.length > 0
  ) {
    return `${API_BASE_URL}${phone.images[0]}`;
  }

  return noImage;
};
