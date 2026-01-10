import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: JSON.parse(localStorage.getItem("orders")) || [],
};

const adminOrdersSlice = createSlice({
  name: "adminOrders",
  initialState,
  reducers: {
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;

      const order = state.orders.find(o => o.orderId === orderId);
      if (order) {
        order.status = status;
        localStorage.setItem("orders", JSON.stringify(state.orders));
      }
    },
  },
});

export const { updateOrderStatus } = adminOrdersSlice.actions;
export default adminOrdersSlice.reducer;
