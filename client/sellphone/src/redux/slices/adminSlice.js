import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  admin: JSON.parse(localStorage.getItem("admin")) || null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdmin: (state, action) => {
      state.admin = action.payload;
      JSON.parse(localStorage.getItem("admin"))
    },
    clearAdmin: (state) => {
      state.admin = null;
      localStorage.removeItem("admin");
    },
    setPhonesFromAdmin: (state, action) => {
      state.list = action.payload;
    },
  },
});

export const { setAdmin, clearAdmin } = adminSlice.actions;
export default adminSlice.reducer;
