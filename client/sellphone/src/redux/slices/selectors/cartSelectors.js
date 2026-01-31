import { createSelector } from "@reduxjs/toolkit";

/* ================= BASE SELECTORS ================= */
const selectCartState = (state) => state.cart;
const selectPhonesList = (state) => state.phones.list;

/* ================= CART ITEMS ================= */
export const selectCartItems = createSelector(
  [selectCartState],
  (cart) => cart.items
);

/* ================= CART TOTAL ================= */
export const selectCartTotal = createSelector(
  [selectCartItems],
  (items) =>
    items.reduce(
      (total, item) => total + item.phone.price * item.quantity,
      0
    )
);

/* ================= CART COUNT ================= */
export const selectCartCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((count, item) => count + item.quantity, 0)
);

/* ================= SUGGESTED PHONES ================= */
export const selectSuggestedPhones = createSelector(
  [selectCartItems, selectPhonesList],
  (cartItems, phones) => {
    if (!phones || phones.length === 0) return [];

    const cartPhoneIds = new Set(cartItems.map((i) => i.phone._id));
    const cartBrands = new Set(cartItems.map((i) => i.phone.brand));

    return phones
      .filter((p) => !cartPhoneIds.has(p._id))
      .sort((a, b) => {
        const aScore = cartBrands.has(a.brand) ? 1 : 0;
        const bScore = cartBrands.has(b.brand) ? 1 : 0;
        return bScore - aScore;
      })
      .slice(0, 8);
  }
);
