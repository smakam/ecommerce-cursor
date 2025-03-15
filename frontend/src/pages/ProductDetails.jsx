import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { addToCart } from "../redux/slices/cartSlice";
import { api } from "../services/api";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const cartError = useSelector((state) => state.cart.error);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch product");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await dispatch(
        addToCart({ productId: product._id, quantity: 1 })
      ).unwrap();
      setShowSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">Product not found</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {cartError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {cartError}
        </Alert>
      )}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="500"
              image={product.images[0].url}
              alt={product.name}
              sx={{ objectFit: "contain", p: 2 }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Chip label={product.category} color="primary" />
              </Box>
              <Typography variant="h4" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                ${product.price.toFixed(2)}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {product.description}
              </Typography>
              <Typography
                variant="body1"
                color={product.stock > 0 ? "success.main" : "error.main"}
                gutterBottom
              >
                {product.stock > 0
                  ? `${product.stock} units in stock`
                  : "Out of stock"}
              </Typography>
              <Button
                variant="contained"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                fullWidth
                sx={{ mt: 2 }}
              >
                {addingToCart ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Add to Cart"
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message="Item added to cart successfully"
      />
    </Container>
  );
};

export default ProductDetails;
