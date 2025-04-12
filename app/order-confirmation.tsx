import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function OrderConfirmationScreen() {
  const params = useLocalSearchParams();
  const { orderId } = params;

  // Mock order details - in a real app, you would fetch this from your API
  const orderDetails = {
    id:
      orderId ||
      "ORD" +
        Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0"),
    date: new Date().toISOString(),
    total: 299.97,
    paymentMethod: "Razorpay",
    shippingAddress: "123 Main St, Anytown, USA",
    items: [
      {
        name: "Wireless Headphones",
        price: 99.99,
        quantity: 2,
      },
      {
        name: "Smart Watch",
        price: 99.99,
        quantity: 1,
      },
    ],
    shippingCost: 5.99,
    tax: 18.0,
    discount: 0,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            const homePath = { pathname: "(tabs)" } as any;
            router.push(homePath);
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Confirmation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successMessage}>
            Your order has been placed successfully.
          </Text>
        </View>

        <View style={styles.orderInfoContainer}>
          <Text style={styles.sectionTitle}>Order Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Number:</Text>
            <Text style={styles.infoValue}>{orderDetails.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>
              {formatDate(orderDetails.date)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Method:</Text>
            <Text style={styles.infoValue}>{orderDetails.paymentMethod}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shipping Address:</Text>
            <Text style={styles.infoValue}>{orderDetails.shippingAddress}</Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {orderDetails.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image
                source={{ uri: "https://via.placeholder.com/150" }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.shippingAddress}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text style={styles.addressLine}>{orderDetails.shippingAddress}</Text>
        </View>

        <View style={styles.orderSummaryContainer}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              $
              {orderDetails.items
                .reduce((total, item) => total + item.price * item.quantity, 0)
                .toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              ${orderDetails.shippingCost.toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>
              ${orderDetails.tax.toFixed(2)}
            </Text>
          </View>

          {orderDetails.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>
                -${orderDetails.discount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ${orderDetails.total.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.trackOrderButton}
            onPress={() => {
              const ordersPath = { pathname: "(tabs)/orders" } as any;
              router.push(ordersPath);
            }}
          >
            <Text style={styles.trackOrderButtonText}>Track Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              const ordersPath = { pathname: "(tabs)/orders" } as any;
              router.push(ordersPath);
            }}
          >
            <Text style={styles.buttonText}>View Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={() => {
              const homePath = { pathname: "(tabs)" } as any;
              router.push(homePath);
            }}
          >
            <Text style={styles.outlineButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 24, // Same width as back button for proper centering
  },
  content: {
    flex: 1,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  orderInfoContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  infoLabel: {
    width: 140,
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  orderItems: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
  },
  shippingAddress: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
  },
  addressLine: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  orderSummaryContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
  },
  discountValue: {
    color: "#4CAF50",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066CC",
  },
  actionsContainer: {
    padding: 16,
    marginBottom: 32,
  },
  trackOrderButton: {
    backgroundColor: "#0066CC",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  trackOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#0066CC",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#0066CC",
  },
  outlineButtonText: {
    color: "#0066CC",
    fontSize: 16,
    fontWeight: "bold",
  },
});
