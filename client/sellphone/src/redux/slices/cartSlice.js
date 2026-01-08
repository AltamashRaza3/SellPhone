import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [], // { phone, quantity }
  },
  reducers: {
    addToCart: (state, action) => {
  if (!action.payload) return;

  const item = state.items.find(
    (i) => i.phone._id === action.payload._id
  );

  if (item) {
    item.quantity += 1;
  } else {
    state.items.push({
      phone: action.payload,
      quantity: 1,
    });
  }
},
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.phone._id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.phone._id === id);
      if (item) item.quantity = quantity;
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
