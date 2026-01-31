// utils/normalizePhone.js
export const normalizePhone = (phone) => {
  if (!phone) return phone;

  if (Array.isArray(phone.images) && phone.images.length > 0) {
    return phone;
  }

  if (phone.image) {
    return {
      ...phone,
      images: [phone.image],
    };
  }

  return {
    ...phone,
    images: [],
  };
};
