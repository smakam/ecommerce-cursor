import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  TextField,
  Box,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { removeFromCart, updateCartItem } from "../redux/slices/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const totalQuantity = useSelector((state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );
  const totalAmount = useSelector((state) =>
    state.cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
  );

  const handleQuantityChange = (productId, quantity) => {
    if (quantity > 0) {
      dispatch(updateCartItem({ productId, quantity: parseInt(quantity) }));
    }
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleCheckout = () => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login?redirect=cart");
      return;
    }
    // Navigate to checkout page
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h5">Your cart is empty</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate("/")}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      <List>
        {cartItems.map((item) => (
          <React.Fragment key={item.product._id}>
            <ListItem>
              <img
                src={
                  item.product.images[0]?.url ||
                  "https://via.placeholder.com/100"
                }
                alt={item.product.name}
                style={{ width: 100, marginRight: 16 }}
              />
              <ListItemText
                primary={item.product.name}
                secondary={`$${item.product.price.toFixed(2)}`}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.product._id, e.target.value)
                  }
                  inputProps={{ min: 1 }}
                  size="small"
                  sx={{ width: 80 }}
                />
                <Typography>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </Typography>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveItem(item.product._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </Box>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
      <Box sx={{ mt: 4, textAlign: "right" }}>
        <Typography variant="h6" gutterBottom>
          Total Items: {totalQuantity}
        </Typography>
        <Typography variant="h5" color="primary" gutterBottom>
          Total Amount: ${totalAmount.toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </Button>
      </Box>
    </Container>
  );
};

export default Cart;
