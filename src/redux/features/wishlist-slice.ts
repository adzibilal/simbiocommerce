import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  items: WishListItem[];
};

type WishListItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  status?: string;
  imageUrl?: string;
  weight: number;
  stock: number;
};

const initialState: InitialState = {
  items: [],
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const { id, name, price, quantity, imageUrl, weight, stock, status } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          name,
          price,
          quantity,
          imageUrl,
          weight,
          stock,
          status,
        });
      }
    },
    removeItemFromWishlist: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },

    removeAllItemsFromWishlist: (state) => {
      state.items = [];
    },
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;
export default wishlist.reducer;
