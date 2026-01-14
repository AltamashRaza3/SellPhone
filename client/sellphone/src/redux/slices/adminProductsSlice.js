import { createSlice } from "@reduxjs/toolkit";
import { setPhones } from "./phonesSlice";

/* ================== LOCAL STORAGE ================== */
const STORAGE_KEY = "adminProducts";

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (products) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

/* ================== INITIAL STATE ================== */
const initialState = {
  products: loadFromStorage(),
};

/* ================== SLICE ================== */
const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    addProduct: (state, action) => {
      state.products.unshift(action.payload);
      saveToStorage(state.products);
    },

    updateProduct: (state, action) => {
      const index = state.products.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.products[index] = action.payload;
        saveToStorage(state.products);
      }
    },

    deleteProduct: (state, action) => {
      state.products = state.products.filter(
        (p) => p._id !== action.payload
      );
      saveToStorage(state.products);
    },

    toggleProduct: (state, action) => {
      const product = state.products.find(
        (p) => p._id === action.payload
      );
      if (product) {
        product.isActive = !product.isActive;
        saveToStorage(state.products);
      }
    },
  },
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
} = adminProductsSlice.actions;

export default adminProductsSlice.reducer;

/* ======================================================
   🔁 ADMIN → PUBLIC BRIDGE (SOURCE OF TRUTH)
   ====================================================== */

const publishToPublic = (getState, dispatch) => {
  const { adminProducts } = getState();

  const activeProducts = adminProducts.products.filter(
    (p) => p.isActive !== false
  );

  dispatch(setPhones(activeProducts));
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
export const deleteProductAndPublish = (id) => (dispatch, getState) => {
  dispatch(deleteProduct(id));
  publishToPublic(getState, dispatch);
};

/* TOGGLE */
export const toggleProductAndPublish = (id) => (dispatch, getState) => {
  dispatch(toggleProduct(id));
  publishToPublic(getState, dispatch);
};
