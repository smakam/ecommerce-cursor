import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import GroupIcon from "@mui/icons-material/Group";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // profile, users, orders
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userResponse = await api.get("/auth/profile");
        setUser(userResponse.data.user);

        // If user is admin, fetch all users and all orders
        if (userResponse.data.user?.role === "admin") {
          const [usersResponse, ordersResponse] = await Promise.all([
            api.get("/auth/users"),
            api.get("/orders/all"),
          ]);
          setAllUsers(usersResponse.data.users || []);
          setAllOrders(ordersResponse.data || []);
        }

        const myOrdersResponse = await api.get("/orders/myorders");
        setOrders(myOrdersResponse.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch user data");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  const renderUsersList = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Join Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allUsers.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip
                  label={user.role}
                  color={
                    user.role === "admin"
                      ? "error"
                      : user.role === "seller"
                      ? "secondary"
                      : "primary"
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderAllOrders = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Items</TableCell>
            <TableCell>Total Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allOrders.map((order) => (
            <TableRow key={order._id}>
              <TableCell>{order._id.slice(-8)}</TableCell>
              <TableCell>{order.user?.name || "N/A"}</TableCell>
              <TableCell>
                {order.orderItems?.map((item, index) => (
                  <div key={index}>
                    {item.quantity}x {item.product?.name || "Product not found"}
                  </div>
                ))}
              </TableCell>
              <TableCell>${order.totalAmount?.toFixed(2)}</TableCell>
              <TableCell>
                <Chip
                  label={order.orderStatus}
                  color={
                    order.orderStatus === "Delivered"
                      ? "success"
                      : order.orderStatus === "Processing"
                      ? "warning"
                      : "default"
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {user?.role === "admin" && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant={activeTab === "profile" ? "contained" : "outlined"}
            onClick={() => setActiveTab("profile")}
            sx={{ mr: 1 }}
          >
            Profile
          </Button>
          <Button
            variant={activeTab === "users" ? "contained" : "outlined"}
            onClick={() => setActiveTab("users")}
            sx={{ mr: 1 }}
            startIcon={<GroupIcon />}
          >
            Users
          </Button>
          <Button
            variant={activeTab === "orders" ? "contained" : "outlined"}
            onClick={() => setActiveTab("orders")}
            sx={{ mr: 1 }}
            startIcon={<ShoppingBasketIcon />}
          >
            All Orders
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/add-product")}
          >
            Add Product
          </Button>
        </Box>
      )}

      {activeTab === "users" && user?.role === "admin" ? (
        renderUsersList()
      ) : activeTab === "orders" && user?.role === "admin" ? (
        renderAllOrders()
      ) : (
        <Grid container spacing={3}>
          {/* User Info */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mb: 2,
                    bgcolor: "primary.main",
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {user?.name || "User"}
                </Typography>
                <Chip
                  label={
                    user?.role === "admin"
                      ? "Admin"
                      : user?.role === "seller"
                      ? "Seller"
                      : "Customer"
                  }
                  color={
                    user?.role === "admin"
                      ? "error"
                      : user?.role === "seller"
                      ? "secondary"
                      : "primary"
                  }
                />
              </Box>
              <List>
                <ListItem>
                  <PersonIcon sx={{ mr: 2 }} />
                  <ListItemText
                    primary="Name"
                    secondary={user?.name || "N/A"}
                  />
                </ListItem>
                <ListItem>
                  <EmailIcon sx={{ mr: 2 }} />
                  <ListItemText
                    primary="Email"
                    secondary={user?.email || "N/A"}
                  />
                </ListItem>
                <ListItem>
                  <ShoppingBasketIcon sx={{ mr: 2 }} />
                  <ListItemText
                    primary="Total Orders"
                    secondary={orders?.length || 0}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                My Orders
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {!orders?.length ? (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                >
                  No orders found
                </Typography>
              ) : (
                orders.map((order) => (
                  <Paper key={order?._id || Math.random()} sx={{ p: 2, mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        Order #{order?._id?.slice(-8) || "N/A"}
                      </Typography>
                      <Chip
                        label={order?.orderStatus || "Processing"}
                        color={
                          order?.orderStatus === "Delivered"
                            ? "success"
                            : order?.orderStatus === "Processing"
                            ? "warning"
                            : "default"
                        }
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Placed on{" "}
                      {order?.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {order?.orderItems?.map((item) => (
                        <Box
                          key={item?._id || Math.random()}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2">
                            {item?.quantity || 0}x{" "}
                            {item?.product?.name || "Product not found"}
                          </Typography>
                          <Typography variant="body2">
                            $
                            {(
                              (item?.quantity || 0) *
                              (item?.product?.price || 0)
                            ).toFixed(2)}
                          </Typography>
                        </Box>
                      )) || "No items"}
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 1,
                      }}
                    >
                      <Typography variant="subtitle2">Total Amount:</Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        ${(order?.totalAmount || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                ))
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Profile;
