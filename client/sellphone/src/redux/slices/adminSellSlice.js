import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requests: [
    {
      id: "SELL-001",
      brand: "Apple",
      model: "iPhone 12",
      priceExpected: 28000,
      condition: "Good",
      storage: "128GB",
      user: {
        name: "Altamash",
        email: "user@gmail.com",
      },
      status: "pending",
      createdAt: "2026-01-10",
    },
    {
      id: "SELL-002",
      brand: "Samsung",
      model: "Galaxy S21",
      priceExpected: 19000,
      condition: "Excellent",
      storage: "256GB",
      user: {
        name: "Ravi",
        email: "ravi@gmail.com",
      },
      status: "pending",
      createdAt: "2026-01-09",
    },
  ],
};

const adminSellSlice = createSlice({
  name: "adminSell",
  initialState,
  reducers: {
    updateSellStatus: (state, action) => {
      const { id, status } = action.payload;
      const req = state.requests.find((r) => r.id === id);
      if (req) req.status = status;
    },
  },
});

export const { updateSellStatus } = adminSellSlice.actions;
export default adminSellSlice.reducer;
