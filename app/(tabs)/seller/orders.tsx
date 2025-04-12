import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { sellerAPI } from "../../../src/api";
import { useFocusEffect } from "@react-navigation/native";

type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
};

// Add a type for list items
type ListItem =
  | { type: "header"; title: string; id: string }
  | { type: "order"; data: Order; id: string };

export default function SellerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching seller orders...");
      const response = await sellerAPI.getOrders();
      console.log("Seller orders response:", response.data);

      if (response.data && Array.isArray(response.data)) {
        const formattedOrders = response.data.map((order: any) => ({
          _id: order._id,
          customerName: order.user?.name || "Customer",
          customerEmail: order.user?.email || "No email",
          orderDate: order.createdAt || new Date().toISOString(),
          status: order.status || "Pending",
          total: order.totalAmount || 0,
          items: (order.items || []).map((item: any) => ({
            productId: item.product?._id || item.product || "",
            productName: item.product?.name || "Product",
            quantity: item.quantity || 1,
            price: item.price || 0,
          })),
          shippingAddress: order.shippingAddress || "No address provided",
          paymentMethod: order.paymentMethod || "Not specified",
        }));
        setOrders(formattedOrders);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error fetching seller orders:", error);
      setError(error.message || "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Refresh orders when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("Seller orders screen focused, refreshing orders");
      fetchOrders();
    }, [])
  );

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return "#FFC107"; // amber
      case "Processing":
        return "#2196F3"; // blue
      case "Shipped":
        return "#9C27B0"; // purple
      case "Delivered":
        return "#4CAF50"; // green
      case "Cancelled":
        return "#F44336"; // red
      default:
        return "#757575"; // grey
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    currentStatus: OrderStatus
  ) => {
    let availableStatuses: OrderStatus[] = [];

    switch (currentStatus) {
      case "Pending":
        availableStatuses = ["Processing", "Cancelled"];
        break;
      case "Processing":
        availableStatuses = ["Shipped", "Cancelled"];
        break;
      case "Shipped":
        availableStatuses = ["Delivered", "Cancelled"];
        break;
      case "Delivered":
        Alert.alert(
          "Order Complete",
          "This order has been completed and delivered."
        );
        return;
      case "Cancelled":
        Alert.alert(
          "Order Cancelled",
          "This order has been cancelled and cannot be updated."
        );
        return;
    }

    const buttons = availableStatuses.map((status) => ({
      text: status,
      onPress: async () => {
        try {
          setLoading(true);
          await sellerAPI.updateOrderStatus(orderId, status);
          await fetchOrders();
          Alert.alert("Success", `Order status updated to ${status}`);
        } catch (error) {
          console.error("Error updating order status:", error);
          Alert.alert("Error", "Failed to update order status");
        } finally {
          setLoading(false);
        }
      },
    }));

    Alert.alert("Update Order Status", `Current status: ${currentStatus}`, [
      ...buttons,
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleOrderPress = (order: Order) => {
    Alert.alert(
      `Order ${order._id}`,
      `Customer: ${order.customerName}\nStatus: ${
        order.status
      }\nTotal: $${order.total.toFixed(2)}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update Status",
          onPress: () => handleUpdateOrderStatus(order._id, order.status),
        },
        {
          text: "View Details",
          onPress: () => {
            // Navigate to order details in future implementation
            Alert.alert("View Details", "Order details view coming soon!");
          },
        },
      ]
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item._id}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.orderDetail}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.orderDetailText}>{item.customerName}</Text>
        </View>

        <View style={styles.orderDetail}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.orderDetailText}>
            {formatDate(item.orderDate)}
          </Text>
        </View>

        <View style={styles.orderDetail}>
          <Ionicons name="cart-outline" size={16} color="#666" />
          <Text style={styles.orderDetailText}>
            {item.items.length} {item.items.length > 1 ? "items" : "item"}
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
        <Ionicons name="chevron-forward" size={18} color="#aaa" />
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  // Group orders by status
  const pendingOrders = orders.filter((order) => order.status === "Pending");
  const processingOrders = orders.filter(
    (order) => order.status === "Processing"
  );
  const shippedOrders = orders.filter((order) => order.status === "Shipped");
  const completedOrders = orders.filter(
    (order) => order.status === "Delivered" || order.status === "Cancelled"
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={50} color="#ccc" />
      <Text style={styles.emptyText}>No orders found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Updating order...</Text>
        </View>
      ) : (
        <FlatList
          data={[
            { type: "header" as const, title: "Pending", id: "pending-header" },
            ...pendingOrders.map((order) => ({
              type: "order" as const,
              data: order,
              id: `pending-${order._id}`,
            })),
            {
              type: "header" as const,
              title: "Processing",
              id: "processing-header",
            },
            ...processingOrders.map((order) => ({
              type: "order" as const,
              data: order,
              id: `processing-${order._id}`,
            })),
            { type: "header" as const, title: "Shipped", id: "shipped-header" },
            ...shippedOrders.map((order) => ({
              type: "order" as const,
              data: order,
              id: `shipped-${order._id}`,
            })),
            {
              type: "header" as const,
              title: "Completed & Cancelled",
              id: "completed-header",
            },
            ...completedOrders.map((order) => ({
              type: "order" as const,
              data: order,
              id: `completed-${order._id}`,
            })),
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (item.type === "header") {
              return renderSectionHeader(item.title);
            } else {
              return renderOrderItem({ item: item.data });
            }
          }}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
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
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  orderItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderInfo: {
    marginBottom: 12,
  },
  orderDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  orderDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0066CC",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#666",
  },
});
