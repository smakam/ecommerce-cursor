import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Rating,
  Box,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          boxShadow: 6,
          cursor: "pointer",
        },
      }}
      onClick={handleClick}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.images?.[0]?.url || "https://via.placeholder.com/200"}
        alt={product.name}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
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
            mb: 1,
          }}
        >
          {product.description}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Rating
            value={product.averageRating || 0}
            precision={0.5}
            readOnly
            size="small"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({product.ratings?.length || 0})
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" color="primary">
            ${product.price.toFixed(2)}
          </Typography>
          {product.stock > 0 ? (
            <Chip
              label={`${product.stock} in stock`}
              color="success"
              size="small"
            />
          ) : (
            <Chip label="Out of stock" color="error" size="small" />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
