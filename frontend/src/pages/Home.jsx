import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Slider,
  CircularProgress,
  Alert,
} from "@mui/material";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/api";

// Temporary sample products while backend is being fixed
const sampleProducts = [
  {
    _id: "1",
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    ratings: 4.5,
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      },
    ],
    category: "Electronics",
    stock: 10,
    numOfReviews: 25,
    reviews: [],
  },
  {
    _id: "2",
    name: "Smart Watch",
    description: "Feature-rich smartwatch with health tracking",
    price: 299.99,
    ratings: 4.0,
    images: [
      {
        url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80",
      },
    ],
    category: "Electronics",
    stock: 15,
    numOfReviews: 18,
    reviews: [],
  },
  {
    _id: "3",
    name: "Laptop Backpack",
    description: "Durable laptop backpack with multiple compartments",
    price: 49.99,
    ratings: 4.8,
    images: [
      {
        url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
      },
    ],
    category: "Accessories",
    stock: 50,
    numOfReviews: 32,
    reviews: [],
  },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [sort, setSort] = useState("");

  const categories = [
    "Electronics",
    "Cameras",
    "Laptops",
    "Accessories",
    "Headphones",
    "Food",
    "Books",
    "Clothes/Shoes",
    "Beauty/Health",
    "Sports",
    "Outdoor",
    "Home",
  ];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        ...(category && { category }),
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        ...(sort && { sort }),
      };
      const response = await getProducts(filters);
      setProducts(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.response?.data?.message || "Error fetching products");
      // Set sample products as fallback only on error
      setProducts(sampleProducts);
    } finally {
      setLoading(false);
    }
  }, [category, priceRange, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Showing sample products instead:
        </Typography>
        <Grid container spacing={3}>
          {sampleProducts.map((product) => (
            <Grid item key={product._id} xs={12} sm={6} md={4}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {/* Filters */}
        <Grid item xs={12} md={3}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography gutterBottom>Price Range</Typography>
          <Slider
            value={priceRange}
            onChange={(e, newValue) => setPriceRange(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={15000}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <TextField
              size="small"
              label="Min"
              value={priceRange[0]}
              type="number"
              onChange={(e) =>
                setPriceRange([Number(e.target.value), priceRange[1]])
              }
            />
            <TextField
              size="small"
              label="Max"
              value={priceRange[1]}
              type="number"
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sort}
              label="Sort By"
              onChange={(e) => setSort(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="price_asc">Price: Low to High</MenuItem>
              <MenuItem value="price_desc">Price: High to Low</MenuItem>
              <MenuItem value="ratings">Ratings</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {products.length === 0 ? (
                <Grid item xs={12}>
                  <Typography variant="h6" textAlign="center">
                    No products found
                  </Typography>
                </Grid>
              ) : (
                products.map((product) => (
                  <Grid item key={product._id} xs={12} sm={6} md={4}>
                    <ProductCard product={product} />
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
