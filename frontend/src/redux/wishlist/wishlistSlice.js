import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [], // Array of property IDs in the wishlist
  },
  reducers: {
    addToWishlist: (state, action) => {
      state.items.push(action.payload); // Add property ID to the wishlist
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((id) => id !== action.payload); // Remove property ID from the wishlist
    },
    setWishlist: (state, action) => {
      state.items = action.payload; // Set the entire wishlist (e.g., after fetching from the backend)
    },
  },
});

export const { addToWishlist, removeFromWishlist, setWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
