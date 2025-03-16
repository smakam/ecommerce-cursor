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

        // First get user data from localStorage as a fallback
        const storedUser = JSON.parse(localStorage.getItem("user"));
        console.log("User data from localStorage:", storedUser);

        // Then try to get fresh data from the API
        let userData = null;
        try {
          const userResponse = await api.get("/api/auth/current-user");
          console.log("Current user data from API:", userResponse.data);
          console.log("Is admin?", userResponse.data?.isAdmin);
          userData = userResponse.data;
          setUser(userData);
        } catch (userErr) {
          console.error("Error fetching current user:", userErr);
          // Fall back to stored user data if API call fails
          if (storedUser) {
            console.log("Using stored user data instead");
            userData = storedUser;
            setUser(storedUser);
          } else {
            throw userErr; // Re-throw if we don't have fallback data
          }
        }

        // If user is admin, fetch all users and all orders
        if (userData?.isAdmin) {
          console.log("User is admin, fetching all users and orders");

          try {
            const usersResponse = await api.get("/api/auth/users");
            console.log("All users:", usersResponse.data);
            // Ensure we're setting an array, handle both formats
            const usersData = Array.isArray(usersResponse.data)
              ? usersResponse.data
              : usersResponse.data?.users || [];
            setAllUsers(usersData);
          } catch (usersErr) {
            console.error("Error fetching all users:", usersErr);
            setError((prev) => prev || "Failed to fetch users");
          }

          try {
            console.log("Fetching all orders...");
            const ordersResponse = await api.get("/api/orders/all");
            console.log("All orders response:", ordersResponse);
            console.log("All orders data:", ordersResponse.data);
            setAllOrders(ordersResponse.data || []);
          } catch (ordersErr) {
            console.error("Error fetching all orders:", ordersErr);
            console.error("Error details:", ordersErr.response?.data);
            setError((prev) => prev || "Failed to fetch all orders");
          }
        }

        // Fetch user's orders
        try {
          const myOrdersResponse = await api.get("/api/orders");
          console.log("My orders:", myOrdersResponse.data);
          setOrders(myOrdersResponse.data || []);
        } catch (ordersErr) {
          console.error("Error fetching user orders:", ordersErr);
          setError((prev) => prev || "Failed to fetch your orders");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
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
          {!Array.isArray(allUsers) || allUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            allUsers.map((user) => (
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
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderAllOrders = () => {
    console.log("Rendering all orders:", allOrders);

    return (
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
            {allOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              allOrders.map((order) => {
                // Handle different order formats
                const orderItems = order.orderItems || order.items || [];
                const status =
                  order.status || order.orderStatus || "Processing";
                const userName =
                  order.user?.name ||
                  (typeof order.user === "string"
                    ? order.user.slice(-6)
                    : "N/A");

                console.log(
                  "Processing order:",
                  order._id,
                  "items:",
                  orderItems
                );

                return (
                  <TableRow key={order._id}>
                    <TableCell>{order._id.slice(-8)}</TableCell>
                    <TableCell>{userName}</TableCell>
                    <TableCell>
                      {orderItems.length > 0 ? (
                        orderItems.map((item, index) => (
                          <div key={index}>
                            {item.quantity}x {item.product?.name || "Product"}
                          </div>
                        ))
                      ) : (
                        <div>No items</div>
                      )}
                    </TableCell>
                    <TableCell>
                      ${order.totalAmount?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status}
                        color={
                          status === "Delivered" || status === "delivered"
                            ? "success"
                            : status === "Processing" || status === "processing"
                            ? "warning"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Add seller-specific functionality
  const renderSellerDashboard = () => (
    <Box sx={{ mb: 3 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/manage-products")}
        sx={{ mr: 1 }}
      >
        Manage Products
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => navigate("/add-product")}
      >
        Add New Product
      </Button>
    </Box>
  );

  // Add admin-specific functionality
  const renderAdminDashboard = () => (
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
      {renderSellerDashboard()}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Debug information */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          User ID: {user?._id}, Name: {user?.name}, Email: {user?.email},
          IsAdmin: {String(user?.isAdmin)}, Role: {user?.role || "N/A"}
        </Typography>
      </Box>

      {user?.isAdmin && renderAdminDashboard()}
      {!user?.isAdmin && user?.role === "seller" && renderSellerDashboard()}

      {activeTab === "users" && user?.isAdmin ? (
        renderUsersList()
      ) : activeTab === "orders" && user?.isAdmin ? (
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
                orders.map((order) => {
                  // Handle different order formats
                  const orderItems = order.orderItems || order.items || [];
                  const status =
                    order.status || order.orderStatus || "Processing";

                  return (
                    <Paper
                      key={order?._id || Math.random()}
                      sx={{ p: 2, mb: 2 }}
                    >
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
                          label={status}
                          color={
                            status === "Delivered" || status === "delivered"
                              ? "success"
                              : status === "Processing" ||
                                status === "processing"
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
                        {orderItems.length > 0 ? (
                          orderItems.map((item, index) => (
                            <Box
                              key={item?._id || index}
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
                          ))
                        ) : (
                          <Typography variant="body2">No items</Typography>
                        )}
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Typography variant="subtitle2">
                          Total Amount:
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="bold">
                          ${(order?.totalAmount || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Profile;
