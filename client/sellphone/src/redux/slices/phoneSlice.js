import { createSlice } from "@reduxjs/toolkit";
import { phones } from "../../utils/dummyPhones";

const phoneSlice = createSlice({
  name: "phones",
  initialState: {
    list: phones,
  },
  reducers: {},
});

export default phoneSlice.reducer;
