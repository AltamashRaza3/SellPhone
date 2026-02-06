import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API_BASE_URL from "../../config/api";

/* ================= FETCH ADMIN PRODUCTS ================= */
export const fetchAdminProducts = createAsyncThunk(
  "adminProducts/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminProductsSlice.reducer;
