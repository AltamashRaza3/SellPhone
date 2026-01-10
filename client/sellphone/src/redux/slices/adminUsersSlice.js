import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: JSON.parse(localStorage.getItem("admin_users")) || [
    {
      id: "u1",
      email: "user1@gmail.com",
      role: "user",
      status: "active",
      createdAt: Date.now() - 86400000,
    },
    {
      id: "u2",
      email: "user2@gmail.com",
      role: "user",
      status: "blocked",
      createdAt: Date.now() - 172800000,
    },
  ],
};

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    toggleUserStatus: (state, action) => {
      const user = state.users.find(u => u.id === action.payload);
      if (user) {
        user.status = user.status === "active" ? "blocked" : "active";
        localStorage.setItem("admin_users", JSON.stringify(state.users));
      }
    },
  },
});

export const { toggleUserStatus } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
