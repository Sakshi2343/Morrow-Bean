import { createSlice } from "@reduxjs/toolkit";
import { updateCart } from "../../../Utils/cartUtils";

const getInitialState = () => {
  const storedCart = localStorage.getItem("cart");

  if (!storedCart) {
    return {
      cartItems: [],
      savedItems: [],
      shippingAddress: {},
      paymentMethod: "PayPal",
    };
  }

  const parsedCart = JSON.parse(storedCart);

  return {
    cartItems: parsedCart.cartItems || [],
    savedItems: parsedCart.savedItems || [],
    shippingAddress: parsedCart.shippingAddress || {},
    paymentMethod: parsedCart.paymentMethod || "PayPal",
    itemsPrice: parsedCart.itemsPrice || "0.00",
    shippingPrice: parsedCart.shippingPrice || "0.00",
    taxPrice: parsedCart.taxPrice || "0.00",
    totalPrice: parsedCart.totalPrice || "0.00",
  };
};

const initialState = getInitialState();

const getLineId = (item = {}) => item.cartItemId || item.variantKey || item._id;

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { user, rating, numReviews, reviews, ...item } = action.payload;
      const itemId = getLineId(item);
      const normalizedItem = {
        ...item,
        cartItemId: itemId,
      };
      const existingItem = state.cartItems.find((entry) => getLineId(entry) === itemId);

      if (existingItem) {
        state.cartItems = state.cartItems.map((x) =>
          getLineId(x) === itemId ? normalizedItem : x
        );
      } else {
        state.cartItems = [...state.cartItems, normalizedItem];
      }

      state.savedItems = state.savedItems.filter((entry) => getLineId(entry) !== itemId);

      return updateCart(state);
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => getLineId(x) !== action.payload);
      return updateCart(state);
    },

    saveForLater: (state, action) => {
      const itemToSave = state.cartItems.find((item) => getLineId(item) === action.payload);

      if (!itemToSave) {
        return updateCart(state);
      }

      state.cartItems = state.cartItems.filter((item) => getLineId(item) !== action.payload);
      state.savedItems = [
        itemToSave,
        ...state.savedItems.filter((item) => getLineId(item) !== action.payload),
      ];

      return updateCart(state);
    },

    moveToCart: (state, action) => {
      const savedItem = state.savedItems.find((item) => getLineId(item) === action.payload);

      if (!savedItem) {
        return updateCart(state);
      }

      const existingItem = state.cartItems.find((item) => getLineId(item) === action.payload);

      if (existingItem) {
        state.cartItems = state.cartItems.map((item) =>
          getLineId(item) === action.payload ? savedItem : item
        );
      } else {
        state.cartItems = [...state.cartItems, savedItem];
      }

      state.savedItems = state.savedItems.filter((item) => getLineId(item) !== action.payload);

      return updateCart(state);
    },

    removeSavedItem: (state, action) => {
      state.savedItems = state.savedItems.filter((item) => getLineId(item) !== action.payload);
      return updateCart(state);
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem("cart", JSON.stringify(state));
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem("cart", JSON.stringify(state));
    },

    clearCartItems: (state, action) => {
      state.cartItems = [];
      return updateCart(state);
    },

    resetCart: () => initialState,
  },
});

export const {
  addToCart,
  removeFromCart,
  saveForLater,
  moveToCart,
  removeSavedItem,
  savePaymentMethod,
  saveShippingAddress,
  clearCartItems,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
