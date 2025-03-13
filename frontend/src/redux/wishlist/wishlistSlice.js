import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    currentUser: null,
  },
  reducers: {
    addToWishlist: (state, action) => {
      if (!state.currentUser) return;

      if (!state.currentUser.wishlist) {
        state.currentUser.wishlist = [action.payload];
      } else if (!state.currentUser.wishlist.includes(action.payload)) {
        state.currentUser.wishlist.push(action.payload);
      }
    },
    removeFromWishlist: (state, action) => {
      if (!state.currentUser || !state.currentUser.wishlist) return;

      state.currentUser.wishlist = state.currentUser.wishlist.filter(
        (id) => id !== action.payload
      );
    },
    updateUserData: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
  },
});

export const { addToWishlist, removeFromWishlist, updateUserData } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
