import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { cartAPI, ordersAPI } from "../../src/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock cart items for demonstration
const INITIAL_CART_ITEMS = [
  {
    product: {
      _id: "1",
      name: "Wireless Headphones",
      price: 99.99,
      imageUrl: "https://via.placeholder.com/150",
    },
    quantity: 1,
  },
  {
    product: {
      _id: "2",
      name: "Smart Watch",
      price: 199.99,
      imageUrl: "https://via.placeholder.com/150",
    },
    quantity: 1,
  },
];

type Product = {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  images?: Array<{ url: string; public_id: string; _id: string }>;
};

type CartItem = {
  product: Product;
  quantity: number;
};

// Local storage key for cart
const CART_STORAGE_KEY = "sreenis_store_cart_items";

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [shippingAddress, setShippingAddress] = useState("");
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUsingLocalCart, setIsUsingLocalCart] = useState(false);

  // Load cart data from local storage on mount
  useEffect(() => {
    loadLocalCartItems();
  }, []);

  // Save cart items to local storage when they change (if using local cart)
  useEffect(() => {
    if (cartItems.length > 0 && isUsingLocalCart) {
      saveLocalCartItems(cartItems);
    }
  }, [cartItems, isUsingLocalCart]);

  // Fetch cart data from API
  useEffect(() => {
    fetchCart();
  }, []);

  // Replace the problematic useEffect with useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      console.log("Cart screen focused, refreshing cart data");
      fetchCart();
      return () => {
        // Optional cleanup function
      };
    }, [])
  );

  // Load cart items from local storage
  const loadLocalCartItems = async () => {
    try {
      console.log("Loading cart items from local storage");
      const storedItems = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems) as CartItem[];
        console.log("Found", parsedItems.length, "items in local storage");
        setCartItems(parsedItems);
        setIsUsingLocalCart(true);
      }
    } catch (error) {
      console.error("Error loading cart from local storage:", error);
    }
  };

  // Save cart items to local storage
  const saveLocalCartItems = async (items: CartItem[]) => {
    try {
      console.log("Saving cart items to local storage:", items.length, "items");
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart to local storage:", error);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      console.log("Fetching cart data...");

      // Try to get cart from API first
      let usingServerCart = false;

      try {
        const response = await cartAPI.getCart();
        console.log("Cart API response:", JSON.stringify(response.data));

        // Check if we have a valid response with items
        if (response.data) {
          let items = [];

          // Handle different response formats
          if (Array.isArray(response.data.items)) {
            // Format: { items: [...] }
            items = response.data.items;
            console.log(
              "Found items array in response.data.items:",
              items.length,
              "items"
            );
          } else if (Array.isArray(response.data)) {
            // Format: direct array
            items = response.data;
            console.log(
              "Found direct items array in response.data:",
              items.length,
              "items"
            );
          } else if (
            response.data.cart &&
            Array.isArray(response.data.cart.items)
          ) {
            // Format: { cart: { items: [...] } }
            items = response.data.cart.items;
            console.log(
              "Found items array in response.data.cart.items:",
              items.length,
              "items"
            );
          }

          if (items.length > 0) {
            console.log("Cart items before filtering:", JSON.stringify(items));
            // Check if items have the expected structure
            const validItems = items.filter(
              (item: any) =>
                item &&
                item.product &&
                typeof item.product === "object" &&
                item.product._id &&
                typeof item.quantity === "number"
            );

            console.log(
              "Valid cart items after filtering:",
              validItems.length,
              "items"
            );

            if (validItems.length > 0) {
              setCartItems(validItems);
              setError(null);
              setIsUsingLocalCart(false);
              usingServerCart = true;

              // Save server items to local storage as backup
              await saveLocalCartItems(validItems);
              return;
            } else {
              console.warn("Items in cart don't have the expected structure");
            }
          } else {
            console.warn("No items found in the cart response");
          }
        }
      } catch (error: any) {
        console.error("Error fetching cart from API:", error);
        // Note: We'll continue to the next section to try local storage
      }

      // If we got here, try to get cart from local storage
      if (!usingServerCart) {
        console.log("Trying to get cart from local storage");
        const storedItems = await AsyncStorage.getItem(CART_STORAGE_KEY);

        if (storedItems) {
          const parsedItems = JSON.parse(storedItems) as CartItem[];
          console.log("Using", parsedItems.length, "items from local storage");
          setCartItems(parsedItems);
          setIsUsingLocalCart(true);
          setError("Using locally stored cart items");
          return;
        }
      }

      // If we get here, neither API nor local storage had valid items
      console.warn(
        "No items found in API or local storage, using fallback data"
      );
      setCartItems(INITIAL_CART_ITEMS);
      setIsUsingLocalCart(true);
      setError("Could not load cart data. Using demo products.");
    } catch (error: any) {
      console.error("Unexpected error in fetchCart:", error);
      setCartItems(INITIAL_CART_ITEMS);
      setError("An unexpected error occurred. Using demo products.");
    } finally {
      setLoading(false);
    }
  };

  // Constants for calculations
  const shippingCost = 5.99;
  const discount = 0; // Set this to a value if there's a discount

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const calculateTotal = () => {
    return calculateSubtotal() + shippingCost - discount;
  };

  // Modify the updateQuantity function to work with local storage
  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      // Update UI immediately for better UX
      const updatedItems = cartItems.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      setCartItems(updatedItems);

      if (isUsingLocalCart) {
        // Save to local storage if using local cart
        saveLocalCartItems(updatedItems);
      } else {
        // Call API to update server
        try {
          await cartAPI.updateCartItem(productId, newQuantity);
        } catch (error) {
          console.error("Error updating cart item on server:", error);
          // If API fails, switch to local cart mode
          setIsUsingLocalCart(true);
          saveLocalCartItems(updatedItems);
        }
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
    }
  };

  // Modify the removeItem function to work with local storage
  const removeItem = async (index: number, productId: string) => {
    try {
      // Update UI immediately for better UX
      const newItems = [...cartItems];
      newItems.splice(index, 1);
      setCartItems(newItems);

      if (isUsingLocalCart) {
        // Save to local storage if using local cart
        saveLocalCartItems(newItems);
      } else {
        // Call API to remove from server
        try {
          await cartAPI.removeFromCart(productId);
        } catch (error) {
          console.error("Error removing item from server cart:", error);
          // If API fails, switch to local cart mode
          setIsUsingLocalCart(true);
          saveLocalCartItems(newItems);
        }
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  // Modify handleClearCart to work with local storage
  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              setCartItems([]);

              if (isUsingLocalCart) {
                // Clear local storage if using local cart
                await AsyncStorage.removeItem(CART_STORAGE_KEY);
              } else {
                // Call API to clear server cart
                try {
                  await cartAPI.clearCart();
                } catch (error) {
                  console.error("Error clearing server cart:", error);
                  // If API fails, at least clear local storage
                  await AsyncStorage.removeItem(CART_STORAGE_KEY);
                }
              }
            } catch (error) {
              console.error("Error clearing cart:", error);
            }
          },
        },
      ]
    );
  };

  const handleSaveAddress = () => {
    if (addressInput.trim() === "") {
      Alert.alert("Error", "Please enter a valid address");
      return;
    }
    setShippingAddress(addressInput);
    setIsAddressModalVisible(false);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Cart Empty", "Add items to your cart before checking out.");
      return;
    }

    if (!shippingAddress) {
      Alert.alert(
        "Missing Information",
        "Please add a shipping address before checkout."
      );
      return;
    }

    try {
      setIsProcessingPayment(true);

      // Create an order via API
      const orderData = {
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod,
      };

      const response = await ordersAPI.createOrder(orderData);

      if (response.data && response.data.order) {
        // Payment successful
        await initiateRazorpayPayment();
      } else {
        throw new Error("Invalid order response");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      // Fallback to simulated checkout for demo purposes
      initiateRazorpayPayment();
    }
  };

  const initiateRazorpayPayment = () => {
    if (!shippingAddress) {
      Alert.alert("Error", "Please add a shipping address");
      return;
    }

    setIsProcessingPayment(true);

    // In a real app, you would make an API call to your backend to create an order
    // The backend would interact with Razorpay API and return an order ID
    // Here we're simulating that process
    setTimeout(() => {
      // Simulate backend response
      const orderData = {
        id: "order_" + Math.random().toString(36).substr(2, 9),
        amount: calculateTotal() * 100, // Razorpay uses amount in smallest currency unit (paise)
        currency: "INR",
        receipt: "receipt_" + Date.now(),
      };

      setIsProcessingPayment(false);

      // In a real implementation, you would use the Razorpay SDK
      // Since we can't fully integrate Razorpay SDK in this demo, we'll simulate the flow
      const options = {
        description: "Payment for your order",
        image: "https://your-app-logo.png",
        currency: orderData.currency,
        key: "rzp_test_YOUR_KEY_HERE", // You would use your actual test/prod key
        amount: orderData.amount,
        name: "Sreeni's Ecommerce Store",
        order_id: orderData.id,
        prefill: {
          email: "customer@example.com",
          contact: "9876543210",
          name: "John Doe",
        },
        theme: { color: "#0066CC" },
      };

      // Simulate payment success for demo purposes
      Alert.alert(
        "Razorpay Payment",
        "This is where the Razorpay payment window would open. In a real app, you would integrate the Razorpay SDK.",
        [
          {
            text: "Simulate Payment Success",
            onPress: () => handlePaymentSuccess(orderData.id),
          },
          {
            text: "Simulate Payment Failure",
            onPress: () => handlePaymentFailure("Payment was cancelled"),
            style: "cancel",
          },
        ]
      );
    }, 1500);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    // In a real app, you would verify the payment with your backend
    setIsProcessingPayment(true);

    // Simulate payment verification and order creation
    setTimeout(() => {
      setIsProcessingPayment(false);
      // Clear cart after successful payment
      setCartItems([]);

      // Navigate to order confirmation page with the order ID
      const orderId =
        "ORD" +
        Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0");

      // Use the correct path format for Expo Router
      const orderConfirmationPath = {
        pathname: "order-confirmation",
        params: { orderId },
      } as any;

      router.push(orderConfirmationPath);
    }, 1000);
  };

  const handlePaymentFailure = (errorMessage: string) => {
    Alert.alert(
      "Payment Failed",
      errorMessage ||
        "There was an issue processing your payment. Please try again."
    );
  };

  // Helper function to get image URL from product
  const getProductImageUrl = (product: Product) => {
    if (product.imageUrl) {
      return product.imageUrl;
    } else if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    return "https://via.placeholder.com/150"; // Placeholder if no image available
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearCartText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Debug info */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => {
              const homePath = { pathname: "(tabs)" } as any;
              router.push(homePath);
            }}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.cartItemsContainer}>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.cartItem}>
                <Image
                  source={{ uri: getProductImageUrl(item.product) }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.product.name}</Text>
                  <Text style={styles.productPrice}>
                    ${item.product.price.toFixed(2)}
                  </Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        updateQuantity(item.product._id, item.quantity - 1)
                      }
                    >
                      <Ionicons name="remove" size={20} color="#0066CC" />
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        updateQuantity(item.product._id, item.quantity + 1)
                      }
                    >
                      <Ionicons name="add" size={20} color="#0066CC" />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeItem(index, item.product._id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            {shippingAddress ? (
              <View style={styles.addressContainer}>
                <Text style={styles.addressText}>{shippingAddress}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsAddressModalVisible(true)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsAddressModalVisible(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#0066CC" />
                <Text style={styles.addButtonText}>Add Shipping Address</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "razorpay" && styles.selectedPaymentOption,
              ]}
              onPress={() => setPaymentMethod("razorpay")}
            >
              <View style={styles.paymentOptionIcon}>
                <Ionicons name="card-outline" size={24} color="#0066CC" />
              </View>
              <View style={styles.paymentOptionDetails}>
                <Text style={styles.paymentOptionTitle}>Razorpay</Text>
                <Text style={styles.paymentOptionSubtitle}>
                  Pay securely with Razorpay
                </Text>
              </View>
              {paymentMethod === "razorpay" && (
                <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.orderSummary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ${calculateSubtotal().toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Shipping</Text>
              <Text style={styles.summaryValue}>
                ${shippingCost.toFixed(2)}
              </Text>
            </View>
            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Discount</Text>
                <Text style={[styles.summaryValue, styles.discountText]}>
                  -${discount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalValue}>
                ${calculateTotal().toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => {
              // Use the correct path format for Expo Router
              const homePath = { pathname: "(tabs)" } as any;
              router.push(homePath);
            }}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Address Modal */}
      {isAddressModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Shipping Address</Text>
              <TouchableOpacity onPress={() => setIsAddressModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your full shipping address"
              value={addressInput}
              onChangeText={setAddressInput}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={styles.saveAddressButton}
              onPress={handleSaveAddress}
            >
              <Text style={styles.saveAddressButtonText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  clearCartText: {
    color: "#ff3b30",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: "#0066CC",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  shopButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  cartItemsContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0066CC",
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  deleteButton: {
    padding: 10,
  },
  section: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addressText: {
    flex: 1,
    fontSize: 16,
  },
  editButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 16,
    color: "#0066CC",
  },
  addButton: {
    backgroundColor: "#0066CC",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  orderSummary: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  discountText: {
    color: "#4CAF50",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 12,
    paddingTop: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066CC",
  },
  checkoutButton: {
    backgroundColor: "#0066CC",
    paddingVertical: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addressInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  saveAddressButton: {
    backgroundColor: "#0066CC",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: "center",
  },
  saveAddressButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPaymentOption: {
    borderColor: "#0066CC",
    backgroundColor: "#E1F5FE",
  },
  paymentOptionIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentOptionDetails: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  paymentOptionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  continueShoppingButton: {
    backgroundColor: "#0066CC",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    margin: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueShoppingText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
  },
  errorText: {
    color: "red",
    fontWeight: "500",
  },
});
