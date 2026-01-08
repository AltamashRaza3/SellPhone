import { createSlice } from "@reduxjs/toolkit";

const selectedPhoneSlice = createSlice({
  name: "selectedPhone",
  initialState: {
    phone: null,
  },
  reducers: {
    setSelectedPhone: (state, action) => {
      state.phone = action.payload;
    },
    clearSelectedPhone: (state) => {
      state.phone = null;
    },
  },
});

export const { setSelectedPhone, clearSelectedPhone } = selectedPhoneSlice.actions;

export default selectedPhoneSlice.reducer;
