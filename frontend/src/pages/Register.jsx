import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { register } from "../services/api";
import { api } from "../services/api";
import { useDispatch } from "react-redux";
import { fetchCart } from "../redux/slices/cartSlice";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const redirectPath =
    new URLSearchParams(location.search).get("redirect") || "/";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      await dispatch(fetchCart());
      navigate(redirectPath);
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/auth/google", {
        credential: credentialResponse.credential,
      });

      if (response.data?.token && response.data?.user) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        await dispatch(fetchCart());
        navigate(redirectPath);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Google registration error:", err);
      setError(
        err.response?.data?.message ||
          "Google registration failed. Please try again."
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google registration failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Register
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Register"}
            </Button>

            <Divider sx={{ my: 3 }}>OR</Divider>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
              />
            </Box>
          </form>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              Already have an account?{" "}
              <Link
                to={`/login${location.search}`}
                style={{ textDecoration: "none", color: "primary.main" }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </GoogleOAuthProvider>
  );
};

export default Register;
