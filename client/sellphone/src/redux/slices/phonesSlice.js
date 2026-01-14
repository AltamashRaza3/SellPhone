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
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setPhonesLoading: (state) => {
      state.loading = true;
    },
    setPhonesError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearPhones: (state) => {
      state.items = [];
    },
  },
});

export const {
  setPhones,
  setPhonesLoading,
  setPhonesError,
  clearPhones,
} = phonesSlice.actions;

export default phonesSlice.reducer;
