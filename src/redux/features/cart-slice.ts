import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  weight: number;
  stock: number;
};

const initialState: InitialState = {
  items: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, name, price, quantity, imageUrl, weight, stock } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        if (existingItem.quantity + quantity <= stock) {
          existingItem.quantity += quantity;
        }
      } else {
        state.items.push({
          id,
          name,
          price,
          quantity,
          imageUrl,
          weight,
          stock,
        });
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem && quantity <= existingItem.stock) {
        existingItem.quantity = quantity;
      }
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});

export const selectTotalWeight = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.weight * item.quantity;
  }, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;
export default cart.reducer;
