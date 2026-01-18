import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  authLoaded: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.authLoaded = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.authLoaded = true;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
