import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Chip,
} from "@mui/material";
import { getOrders, getAllOrders } from "../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = user?.isAdmin ? await getAllOrders() : await getOrders();
        console.log("Orders fetched:", data);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(error.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.isAdmin]);

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

  if (orders.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">You haven't placed any orders yet.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id.slice(-8)}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box>
                    {order.items?.map((item, index) => (
                      <Typography key={index} variant="body2">
                        {item.quantity}x{" "}
                        {item.product?.name || "Product not found"}
                      </Typography>
                    )) || "No items"}
                  </Box>
                </TableCell>
                <TableCell>${(order.totalAmount || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status || "Processing"}
                    color={
                      order.status === "paid"
                        ? "success"
                        : order.status === "pending"
                        ? "warning"
                        : "default"
                    }
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Orders;
