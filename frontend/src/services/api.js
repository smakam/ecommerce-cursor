import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Product related endpoints
export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams({
    ...filters,
    _t: Date.now(),
  });
  const response = await api.get(`/api/products?${params}`);
  return response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post("/api/products", productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/api/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/api/products/${id}`);
  return response.data;
};

// Order related endpoints
export const getOrders = async () => {
  const response = await api.get("/api/orders");
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get("/api/orders/all");
  return response.data;
};

export const getOrder = async (id) => {
  const response = await api.get(`/api/orders/${id}`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post("/api/orders", orderData);
  return response.data;
};

export const verifyPayment = async (orderId, paymentData) => {
  const response = await api.post(
    `/api/orders/${orderId}/verify-payment`,
    paymentData
  );
  return response.data;
};

// User related endpoints
export const login = async (credentials) => {
  const response = await api.post("/api/auth/login", credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post("/api/auth/register", userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/api/auth/current-user");
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/api/auth/users");
  return response.data;
};

// Cart related endpoints
export const getCart = async () => {
  const response = await api.get("/api/cart");
  return response.data;
};

export const addToCart = async (productId, quantity) => {
  const response = await api.post("/api/cart/add", { productId, quantity });
  return response.data;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await api.put(`/api/cart/update/${productId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.delete(`/api/cart/remove/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete("/api/cart/clear");
  return response.data;
};

export { api };
