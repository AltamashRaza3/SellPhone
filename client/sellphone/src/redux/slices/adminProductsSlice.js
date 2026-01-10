import { createSlice } from "@reduxjs/toolkit";
import { setPhones } from "./phonesSlice";

const initialState = {
  products: [],
};

const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    setAdminProducts: (state, action) => {
      state.products = action.payload || [];
    },

    addProduct: (state, action) => {
      state.products.unshift(action.payload);
    },

    updateProduct: (state, action) => {
      const index = state.products.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },

    deleteProduct: (state, action) => {
      state.products = state.products.filter(
        (p) => p._id !== action.payload
      );
    },

    toggleProduct: (state, action) => {
      const product = state.products.find(
        (p) => p._id === action.payload
      );
      if (product) {
        product.isActive = !product.isActive;
      }
    },
  },
});

export const {
  setAdminProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
} = adminProductsSlice.actions;

export default adminProductsSlice.reducer;

/* ======================================================
   ✅ ADMIN → PUBLIC BRIDGE (THUNKS)
   ====================================================== */

const publishToPublic = (getState, dispatch) => {
  const { adminProducts } = getState();

  const publicProducts = adminProducts.products.filter(
    (p) => p.isActive !== false
  );

  dispatch(setPhones(publicProducts));
};

/* CREATE */
export const addProductAndPublish = (product) => (dispatch, getState) => {
  dispatch(addProduct(product));
  publishToPublic(getState, dispatch);
};

/* UPDATE */
export const updateProductAndPublish = (product) => (dispatch, getState) => {
  dispatch(updateProduct(product));
  publishToPublic(getState, dispatch);
};

/* DELETE */
export const deleteProductAndPublish = (productId) => (dispatch, getState) => {
  dispatch(deleteProduct(productId));
  publishToPublic(getState, dispatch);
};

/* TOGGLE VISIBILITY */
export const toggleProductAndPublish = (productId) => (dispatch, getState) => {
  dispatch(toggleProduct(productId));
  publishToPublic(getState, dispatch);
};
