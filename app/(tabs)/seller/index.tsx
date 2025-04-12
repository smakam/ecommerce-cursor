import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

type SellerProduct = {
  _id: string;
  name: string;
  price: number;
  inStock: number;
  sold: number;
  status: "Active" | "Low Stock" | "Out of Stock" | "Inactive";
};

// Dummy data for seller's products
const DUMMY_PRODUCTS: SellerProduct[] = [
  {
    _id: "1",
    name: "Wireless Headphones",
    price: 99.99,
    inStock: 15,
    sold: 42,
    status: "Active" as const,
  },
  {
    _id: "2",
    name: "Smart Watch",
    price: 199.99,
    inStock: 8,
    sold: 23,
    status: "Active" as const,
  },
  {
    _id: "3",
    name: "Smartphone",
    price: 699.99,
    inStock: 5,
    sold: 18,
    status: "Active" as const,
  },
  {
    _id: "4",
    name: "Laptop",
    price: 1299.99,
    inStock: 3,
    sold: 12,
    status: "Low Stock" as const,
  },
  {
    _id: "5",
    name: "Bluetooth Speaker",
    price: 79.99,
    inStock: 0,
    sold: 31,
    status: "Out of Stock" as const,
  },
];

export default function SellerDashboardScreen() {
  const [products, setProducts] = useState<SellerProduct[]>(DUMMY_PRODUCTS);
  const [loading, setLoading] = useState(false);

  const totalSales = products.reduce(
    (sum, product) => sum + product.sold * product.price,
    0
  );
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "Active").length;

  const handleAddProduct = () => {
    const addProductPath = { pathname: "seller/product/add" } as any;
    router.push(addProductPath);
  };

  const handleEditProduct = (product: SellerProduct) => {
    const editProductPath = {
      pathname: "seller/product/[id]",
      params: { id: product._id },
    } as any;
    router.push(editProductPath);
  };

  const getStatusColor = (status: SellerProduct["status"]) => {
    switch (status) {
      case "Active":
        return "green";
      case "Low Stock":
        return "orange";
      case "Out of Stock":
        return "red";
      case "Inactive":
        return "gray";
      default:
        return "black";
    }
  };

  const renderProductItem = ({ item }: { item: SellerProduct }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => handleEditProduct(item)}
    >
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          <Text
            style={[
              styles.productStatus,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status}
          </Text>
        </View>
        <View style={styles.stockInfo}>
          <Text style={styles.stockText}>In Stock: {item.inStock}</Text>
          <Text style={styles.soldText}>Sold: {item.sold}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Seller Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cash-outline" size={24} color="#0066CC" />
            </View>
            <Text style={styles.statValue}>${totalSales.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cube-outline" size={24} color="#0066CC" />
            </View>
            <Text style={styles.statValue}>{totalProducts}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#0066CC"
              />
            </View>
            <Text style={styles.statValue}>{activeProducts}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Products</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddProduct}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity
              onPress={() => Alert.alert("View All Orders", "Coming soon!")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emptyOrders}>
            <Ionicons name="cart-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No recent orders</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E1F5FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#0066CC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: "white",
    fontWeight: "500",
    marginLeft: 4,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0066CC",
  },
  productStatus: {
    fontSize: 14,
  },
  stockInfo: {
    flexDirection: "row",
  },
  stockText: {
    fontSize: 13,
    color: "#666",
    marginRight: 12,
  },
  soldText: {
    fontSize: 13,
    color: "#666",
  },
  viewAllText: {
    color: "#0066CC",
    fontWeight: "500",
  },
  emptyOrders: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#999",
    marginTop: 10,
  },
});
