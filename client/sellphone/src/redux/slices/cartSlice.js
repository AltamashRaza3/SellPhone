import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      if (!action.payload) return;

      const existing = state.items.find(
        (i) => i.phone._id === action.payload._id
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          phone: action.payload,
          quantity: 1,
        });
      }
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (i) => i.phone._id !== action.payload
      );
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.phone._id === id);
      if (item) item.quantity = quantity;
    },

    clearCart: (state) => {
      state.items = [];
    },

    /* 🔥 KEY FIX */
    setCartFromBackend: (state, action) => {
      const incoming = action.payload || [];

      // prevent replacing with same data
      if (
        state.items.length === incoming.length &&
        state.items.every(
          (item, index) =>
            item.phone?._id === incoming[index]?.phoneId?._id &&
            item.quantity === incoming[index]?.quantity
        )
      ) {
        return;
      }

      state.items = incoming.map((item) => ({
        phone: item.phoneId,
        quantity: item.quantity,
      }));
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartFromBackend,
} = cartSlice.actions;

export default cartSlice.reducer;
