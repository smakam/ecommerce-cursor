import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Badge,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { selectTotalQuantity, resetCart } from "../redux/slices/cartSlice";

const Navbar = () => {
  const totalQuantity = useSelector(selectTotalQuantity);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(resetCart());
    navigate("/");
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate("/profile");
    handleMenuClose();
  };

  const handleOrders = () => {
    navigate("/orders");
    handleMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          E-Commerce
        </Typography>

        <IconButton component={Link} to="/cart" color="inherit">
          <Badge badgeContent={totalQuantity || 0} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>

        {token ? (
          <>
            {(user?.isAdmin || user?.role === "seller") && (
              <>
                <IconButton
                  component={Link}
                  to="/add-product"
                  color="inherit"
                  title="Add Product"
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  component={Link}
                  to="/manage-products"
                  color="inherit"
                  title="Manage Products"
                >
                  <InventoryIcon />
                </IconButton>
              </>
            )}
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <PersonIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleOrders}>
                {user?.isAdmin ? "All Orders" : "My Orders"}
              </MenuItem>
              {user?.isAdmin && (
                <MenuItem
                  onClick={() => {
                    navigate("/profile");
                    handleMenuClose();
                  }}
                >
                  Manage Users
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
