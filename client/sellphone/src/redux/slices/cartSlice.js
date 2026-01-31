import { createSlice } from "@reduxjs/toolkit";

/* ================= HELPERS ================= */
const loadGuestCart = () => {
  try {
    const data = localStorage.getItem("guest_cart");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  localStorage.setItem("guest_cart", JSON.stringify(items));
};

/* ================= IMAGE NORMALIZER ================= */
/*
  Handles:
  - inventory products → phone.images[]
  - admin legacy products → phone.image
*/
const normalizePhone = (phone) => {
  if (!phone) return phone;

  return {
    ...phone,
    images:
      Array.isArray(phone.images) && phone.images.length > 0
        ? phone.images
        : phone.image
        ? [phone.image]
        : [],
  };
};

/* ================= INITIAL STATE ================= */
const initialState = {
  items: loadGuestCart(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /* ================= ADD ================= */
    addToCart: (state, action) => {
      if (!action.payload) return;

      const phone = normalizePhone(action.payload);

      const existing = state.items.find(
        (i) => i.phone._id === phone._id
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          phone,
          quantity: 1,
        });
      }

      saveGuestCart(state.items);
    },

    /* ================= REMOVE ================= */
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (i) => i.phone._id !== action.payload
      );
      saveGuestCart(state.items);
    },

    /* ================= UPDATE ================= */
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.phone._id === id);

      if (item && quantity > 0) {
        item.quantity = quantity;
        saveGuestCart(state.items);
      }
    },

    /* ================= CLEAR ================= */
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("guest_cart");
    },

    /* ================= BACKEND SYNC ================= */
    setCartFromBackend: (state, action) => {
      const incoming = action.payload || [];

      state.items = incoming.map((item) => ({
        phone: normalizePhone(item.phoneId),
        quantity: item.quantity,
      }));

      saveGuestCart(state.items);
    },

    /* ================= MERGE AFTER LOGIN ================= */
    mergeGuestCart: (state, action) => {
      const guestItems = action.payload || [];

      guestItems.forEach((guest) => {
        const phone = normalizePhone(guest.phone);

        const existing = state.items.find(
          (i) => i.phone._id === phone._id
        );

        if (existing) {
          existing.quantity += guest.quantity;
        } else {
          state.items.push({
            phone,
            quantity: guest.quantity,
          });
        }
      });

      saveGuestCart(state.items);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartFromBackend,
  mergeGuestCart,
} = cartSlice.actions;

export default cartSlice.reducer;
