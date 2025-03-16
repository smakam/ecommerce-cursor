import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useDispatch } from "react-redux";
import { fetchCart } from "./redux/slices/cartSlice";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import AddProduct from "./pages/AddProduct";
import ManageProducts from "./pages/ManageProducts";
import EditProduct from "./pages/EditProduct";

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

// Protected Route component for authenticated users
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Protected Route component for seller/admin users
const SellerRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!token || (!user?.isAdmin && user?.role !== "seller")) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (token && user) {
      // Fetch cart on app load if user is logged in
      dispatch(fetchCart()).catch((error) => {
        console.error("Failed to fetch cart:", error);
        // If token is invalid, clear it
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      });
    }
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-product"
              element={
                <SellerRoute>
                  <AddProduct />
                </SellerRoute>
              }
            />
            <Route
              path="/manage-products"
              element={
                <SellerRoute>
                  <ManageProducts />
                </SellerRoute>
              }
            />
            <Route
              path="/edit-product/:id"
              element={
                <SellerRoute>
                  <EditProduct />
                </SellerRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
