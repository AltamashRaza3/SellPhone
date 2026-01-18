import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import phonesReducer from "./slices/phonesSlice";
import selectedPhoneReducer from "./slices/selectedPhoneSlice";
import cartReducer from "./slices/cartSlice";
import adminReducer from "./slices/adminSlice"
import adminOrdersReducer from "./slices/adminOrdersSlice"
import adminUsersReducer from "./slices/adminUsersSlice";
import adminProductsReducer from "./slices/adminProductsSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    phones: phonesReducer,
    selectedPhone:selectedPhoneReducer,
    cart: cartReducer,
    admin: adminReducer,
    adminOrders: adminOrdersReducer,
    adminUsers: adminUsersReducer,
    adminProducts: adminProductsReducer,
  },
});

export default store;
