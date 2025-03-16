import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
  CircularProgress,
  Divider,
} from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { api } from "../services/api";
import { fetchCart } from "../redux/slices/cartSlice";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if localStorage is available
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      console.log("localStorage is available");
    } catch (e) {
      console.error("localStorage is not available:", e);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed:`, name === "password" ? "****" : value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with email:", formData.email);

    if (!formData.email || !formData.password) {
      console.log("Validation failed - missing fields");
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    console.log("Making API request to /api/auth/login");

    try {
      const response = await api.post("/api/auth/login", formData);
      console.log("Login response status:", response.status);
      console.log("Full login response data:", response.data);
      console.log("User data:", response.data.user);
      console.log("Is admin?", response.data.user?.isAdmin);

      if (response.data?.token && response.data?.user) {
        try {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          console.log(
            "Stored user data:",
            JSON.parse(localStorage.getItem("user"))
          );

          console.log("Fetching cart data");
          await dispatch(fetchCart());

          console.log("Navigating to home page");
          navigate("/");
        } catch (storageError) {
          console.error("Error storing auth data:", storageError);
          setError("Failed to store authentication data");
        }
      } else {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );

      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        console.log("Cleared localStorage after error");
      } catch (storageError) {
        console.error("Error clearing localStorage:", storageError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/api/auth/google", {
        credential: credentialResponse.credential,
      });

      if (response.data?.token && response.data?.user) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        await dispatch(fetchCart());
        navigate("/");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(
        err.response?.data?.message || "Google login failed. Please try again."
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
              autoComplete="email"
              onFocus={() => console.log("Email field focused")}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
              autoComplete="current-password"
              onFocus={() => console.log("Password field focused")}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
              onClick={() => console.log("Login button clicked")}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Logging in...
                </Box>
              ) : (
                "Login"
              )}
            </Button>

            <Divider sx={{ my: 3 }}>OR</Divider>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
              />
            </Box>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2">
                Don't have an account?{" "}
                <Link href="/register" underline="hover">
                  Register here
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </GoogleOAuthProvider>
  );
};

export default Login;
