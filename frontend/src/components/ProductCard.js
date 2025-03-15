import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { addToCart } from "../redux/slices/cartSlice";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InfoIcon from "@mui/icons-material/Info";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
          transition: "all 0.3s ease-in-out",
        },
      }}
    >
      {product.stock === 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <Typography variant="h6" color="white">
            Out of Stock
          </Typography>
        </Box>
      )}
      <CardMedia
        component="img"
        height="300"
        image={product.images[0].url}
        alt={product.name}
        sx={{ objectFit: "contain", p: 2 }}
      />
      <Box sx={{ position: "absolute", top: 16, left: 16 }}>
        <Chip label={product.category} color="primary" />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {product.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.description}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Typography variant="h6" color="primary">
            ${product.price.toFixed(2)}
          </Typography>
          <Typography
            variant="body2"
            color={product.stock > 0 ? "success.main" : "error.main"}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          fullWidth
        >
          Add to Cart
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<InfoIcon />}
          component={Link}
          to={`/product/${product._id}`}
          fullWidth
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
