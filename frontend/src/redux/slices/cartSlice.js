import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

// Async thunks
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching cart...");
      const response = await api.get("/api/cart");
      console.log("Cart fetch response:", response.data);
      return response.data.cart || { items: [] };
    } catch (error) {
      console.error(
        "Error fetching cart:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      console.log("Adding to cart:", { productId, quantity });
      const response = await api.post("/api/cart/add", { productId, quantity });
      console.log("Add to cart response:", response.data);
      return response.data.cart || { items: [] };
    } catch (error) {
      console.error(
        "Error adding to cart:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to add item to cart"
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/cart/update/${productId}`, {
        quantity,
      });
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update cart item"
      );
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeItem",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/cart/remove/${productId}`);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove item from cart"
      );
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete("/api/cart/clear");
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear cart"
      );
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        console.log("Cart fetch pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        console.log("Cart fetch fulfilled:", action.payload);
        state.loading = false;
        state.items = action.payload?.items || [];
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        console.log("Cart fetch rejected:", action.payload);
        state.loading = false;
        state.error = action.payload || "Failed to fetch cart";
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        console.log("Add to cart pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        console.log("Add to cart fulfilled:", action.payload);
        state.loading = false;
        state.items = action.payload?.items || [];
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        console.log("Add to cart rejected:", action.payload);
        state.loading = false;
        state.error = action.payload || "Failed to add item to cart";
      })
      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update cart item";
      })
      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to remove item from cart";
      })
      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to clear cart";
      });
  },
});

export const { resetCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectTotalQuantity = (state) => {
  console.log("Calculating total quantity from items:", state.cart.items);
  return state.cart.items.reduce((total, item) => total + item.quantity, 0);
};
export const selectTotalPrice = (state) =>
  state.cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

export default cartSlice.reducer;
