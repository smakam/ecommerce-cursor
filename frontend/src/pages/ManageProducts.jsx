import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Button,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "../services/api";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/products");
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/products/${selectedProduct._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== selectedProduct._id));
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Manage Products
        </Typography>
        <Button
          component={Link}
          to="/add-product"
          variant="contained"
          sx={{ mb: 3 }}
        >
          Add New Product
        </Button>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      component={Link}
                      to={`/edit-product/${product._id}`}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(product)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No products found. Start by adding a new product!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedProduct?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageProducts;
