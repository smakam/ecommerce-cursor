import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Use the same Render backend as the web application
const API_URL = "https://ecommerce-cursor.onrender.com/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Error getting token from AsyncStorage:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    return api.post("/auth/login", { email, password });
  },

  register: async (name: string, email: string, password: string) => {
    return api.post("/auth/register", { name, email, password });
  },

  googleAuth: async (credential: string) => {
    return api.post("/auth/google", { credential });
  },

  getCurrentUser: async () => {
    return api.get("/auth/current-user");
  },
};

// Products API
export const productsAPI = {
  getAll: async (params = {}) => {
    return api.get("/products", { params });
  },

  getById: async (id: string) => {
    return api.get(`/products/${id}`);
  },
};

// Cart API
export const cartAPI = {
  getCart: async () => {
    console.log("API: Fetching cart data");
    try {
      const response = await api.get("/cart");
      console.log(
        "API: Get cart success response:",
        JSON.stringify(response.data)
      );
      return response;
    } catch (error) {
      console.log("API: Get cart error:", error);
      throw error;
    }
  },

  addToCart: async (productId: string, quantity: number) => {
    console.log(
      `API: Adding to cart - productId: ${productId}, quantity: ${quantity}`
    );
    try {
      const response = await api.post("/cart/add", { productId, quantity });
      console.log(
        "API: Add to cart success response:",
        JSON.stringify(response.data)
      );
      return response;
    } catch (error) {
      console.log("API: Add to cart error:", error);
      throw error;
    }
  },

  updateCartItem: async (productId: string, quantity: number) => {
    console.log(
      `API: Updating cart item - productId: ${productId}, quantity: ${quantity}`
    );
    try {
      const response = await api.put(`/cart/update/${productId}`, { quantity });
      console.log(
        "API: Update cart item success response:",
        JSON.stringify(response.data)
      );
      return response;
    } catch (error) {
      console.log("API: Update cart item error:", error);
      throw error;
    }
  },

  removeFromCart: async (productId: string) => {
    console.log(`API: Removing from cart - productId: ${productId}`);
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      console.log(
        "API: Remove from cart success response:",
        JSON.stringify(response.data)
      );
      return response;
    } catch (error) {
      console.log("API: Remove from cart error:", error);
      throw error;
    }
  },

  clearCart: async () => {
    console.log("API: Clearing cart");
    try {
      const response = await api.delete("/cart/clear");
      console.log(
        "API: Clear cart success response:",
        JSON.stringify(response.data)
      );
      return response;
    } catch (error) {
      console.log("API: Clear cart error:", error);
      throw error;
    }
  },
};

// Orders API
export const ordersAPI = {
  getOrders: async () => {
    console.log("API: Fetching orders");
    try {
      const response = await api.get("/orders");
      console.log(
        "API: Get orders success response:",
        JSON.stringify(response.data)
      );
      return response;
    } catch (error) {
      console.log("API: Get orders error:", error);
      throw error;
    }
  },

  getOrderById: async (id: string) => {
    console.log(`API: Fetching order by ID: ${id}`);
    try {
      const response = await api.get(`/orders/${id}`);
      console.log(
        "API: Get order by ID success response:",
        JSON.stringify(response.data)
      );
      return response;
    } catch (error) {
      console.log(`API: Get order by ID error for ${id}:`, error);
      throw error;
    }
  },

  createOrder: async (orderData: any) => {
    console.log("API: Creating order with data:", JSON.stringify(orderData));
    try {
      const response = await api.post("/orders", orderData);
      console.log(
        "API: Create order success response:",
        JSON.stringify(response.data)
      );
      return response;
    } catch (error) {
      console.log("API: Create order error:", error);
      throw error;
    }
  },

  verifyPayment: async (orderId: string, paymentData: any) => {
    console.log(
      `API: Verifying payment for order ${orderId} with data:`,
      JSON.stringify(paymentData)
    );
    try {
      const response = await api.post(
        `/orders/${orderId}/verify-payment`,
        paymentData
      );
      console.log(
        "API: Verify payment success response:",
        JSON.stringify(response.data)
      );
      return response;
    } catch (error) {
      console.log(`API: Verify payment error for order ${orderId}:`, error);
      throw error;
    }
  },
};

// Seller API
export const sellerAPI = {
  getProducts: async () => {
    return api.get("/seller/products");
  },

  getProductById: async (id: string) => {
    return api.get(`/seller/products/${id}`);
  },

  createProduct: async (productData: FormData) => {
    return api.post("/seller/products", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateProduct: async (id: string, productData: FormData) => {
    return api.put(`/seller/products/${id}`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteProduct: async (id: string) => {
    return api.delete(`/seller/products/${id}`);
  },

  getOrders: async () => {
    console.log("API: Fetching seller orders");
    try {
      const response = await api.get("/seller/orders");
      console.log(
        "API: Get seller orders success response:",
        JSON.stringify(response.data)
      );
      return response;
    } catch (error) {
      console.log("API: Get seller orders error:", error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    console.log(`API: Updating order ${orderId} status to ${status}`);
    try {
      const response = await api.put(`/seller/orders/${orderId}/status`, {
        status,
      });
      console.log(
        "API: Update order status success response:",
        JSON.stringify(response.data)
      );
      return response;
    } catch (error) {
      console.log(
        `API: Update order status error for order ${orderId}:`,
        error
      );
      throw error;
    }
  },
};

export default {
  auth: authAPI,
  products: productsAPI,
  cart: cartAPI,
  orders: ordersAPI,
  seller: sellerAPI,
};
