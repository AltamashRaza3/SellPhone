import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import phoneReducer from "./slices/phoneSlice";
import selectedPhoneReducer from "./slices/selectedPhoneSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    phones: phoneReducer,
    selectedPhone:selectedPhoneReducer,
    cart: cartReducer,
  },
});

export default store;
