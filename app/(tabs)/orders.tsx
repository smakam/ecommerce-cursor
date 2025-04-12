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
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { ordersAPI } from "../../src/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Dummy orders data for testing
const DUMMY_ORDERS: Order[] = [
  {
    _id: "order1",
    orderNumber: "ORD-001-2023",
    date: "2023-12-15",
    total: 799.98,
    status: "Delivered",
    items: [
      {
        product: {
          _id: "1",
          name: "Wireless Headphones",
          price: 99.99,
        },
        quantity: 1,
      },
      {
        product: {
          _id: "3",
          name: "Smartphone",
          price: 699.99,
        },
        quantity: 1,
      },
    ],
  },
  {
    _id: "order2",
    orderNumber: "ORD-002-2023",
    date: "2023-11-27",
    total: 129.98,
    status: "Processing",
    items: [
      {
        product: {
          _id: "5",
          name: "Bluetooth Speaker",
          price: 79.99,
        },
        quantity: 1,
      },
      {
        product: {
          _id: "2",
          name: "Phone Case",
          price: 24.99,
        },
        quantity: 2,
      },
    ],
  },
  {
    _id: "order3",
    orderNumber: "ORD-003-2023",
    date: "2023-10-10",
    total: 349.99,
    status: "Delivered",
    items: [
      {
        product: {
          _id: "6",
          name: "Tablet",
          price: 349.99,
        },
        quantity: 1,
      },
    ],
  },
];

type OrderItem = {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
};

type Order = {
  _id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDummyData, setUsingDummyData] = useState(false);

  // Fetch orders when the component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Refresh orders when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("Orders screen focused, refreshing orders data");
      fetchOrders();
      return () => {
        // Optional cleanup
      };
    }, [])
  );

  // Function to fetch orders from the API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("Fetching orders from API...");
      const response = await ordersAPI.getOrders();
      console.log("Orders API response:", JSON.stringify(response.data));

      if (response.data && Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} orders from API`);
        if (response.data.length > 0) {
          const formattedOrders = response.data.map((order: any) => ({
            _id: order._id,
            orderNumber:
              order.orderNumber || `ORDER-${order._id.substring(0, 6)}`,
            date: order.createdAt || order.date || new Date().toISOString(),
            total: order.totalAmount || calculateOrderTotal(order),
            status: order.status || "Processing",
            items: Array.isArray(order.items) ? order.items : [],
          }));
          setOrders(formattedOrders);
          setUsingDummyData(false);
          setError(null);
          return;
        }
      }

      // If we reach here, API response not as expected
      console.warn("Orders API response not as expected, using dummy data");
      setOrders(DUMMY_ORDERS);
      setUsingDummyData(true);
      setError("Could not fetch orders from server. Using demo data.");
    } catch (error: any) {
      console.error("Error fetching orders:", error);

      // Check for authentication errors
      if (error.response?.status === 401) {
        setError("Please login to view your orders");
      } else {
        setError("Could not load orders from server. Using demo data.");
      }

      setOrders(DUMMY_ORDERS);
      setUsingDummyData(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate order total if not provided by API
  const calculateOrderTotal = (order: any): number => {
    if (!order.items || !Array.isArray(order.items)) return 0;

    return order.items.reduce((total: number, item: any) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Delivered":
        return "green";
      case "Shipped":
        return "#2196F3";
      case "Processing":
        return "orange";
      case "Pending":
        return "#9E9E9E";
      case "Cancelled":
        return "red";
      default:
        return "#666";
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleOrderPress = (order: Order) => {
    // In a real app, navigate to order details screen
    Alert.alert(
      `Order ${order.orderNumber}`,
      `Status: ${order.status}\nDate: ${formatDate(
        order.date
      )}\nTotal: $${order.total.toFixed(2)}\n\nItems:\n${order.items
        .map(
          (item) =>
            `${item.quantity}x ${item.product.name} - $${(
              item.product.price * item.quantity
            ).toFixed(2)}`
        )
        .join("\n")}`,
      [{ text: "OK" }]
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        <Text style={styles.itemCount}>
          {item.items.length} {item.items.length === 1 ? "item" : "items"}
        </Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${item.total.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.emptyStateText}>No orders yet</Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => {
              const homePath = { pathname: "(tabs)" } as any;
              router.push(homePath);
            }}
          >
            <Text style={styles.shopNowButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#666",
    marginTop: 12,
    marginBottom: 20,
  },
  shopNowButton: {
    backgroundColor: "#0066CC",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  shopNowButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  ordersList: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
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
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  itemCount: {
    fontSize: 14,
    color: "#666",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0066CC",
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  errorText: {
    color: "red",
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#0066CC",
    fontWeight: "bold",
    marginTop: 12,
  },
});
