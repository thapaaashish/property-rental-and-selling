import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    currentAdmin: null,
  },
  reducers: {
    setAdmin: (state, action) => {
      state.currentAdmin = action.payload;
    },
    signoutAdmin: (state) => {
      state.currentAdmin = null;
    },
  },
});

export const { setAdmin, signoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;