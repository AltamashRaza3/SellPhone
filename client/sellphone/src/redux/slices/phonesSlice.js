import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const phonesSlice = createSlice({
  name: "phones",
  initialState,
  reducers: {
    setPhones: (state, action) => {
      state.items = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    clearPhones: (state) => {
      state.items = [];
    },
  },
});

export const { setPhones, clearPhones } = phonesSlice.actions;
export default phonesSlice.reducer;
