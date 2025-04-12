import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { productsAPI, cartAPI } from "../../src/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Reusing the dummy data from the home screen
const DUMMY_PRODUCTS = [
  {
    _id: "1",
    name: "Wireless Headphones",
    price: 99.99,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300",
    rating: 4.5,
    description:
      "High-quality wireless headphones with noise cancellation. Features include long battery life, comfortable ear cups, and premium sound quality. Perfect for music lovers and professionals alike.",
    countInStock: 15,
    category: "Electronics",
  },
  {
    _id: "2",
    name: "Smart Watch",
    price: 199.99,
    imageUrl:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=300",
    rating: 4.2,
    description:
      "Smart watch with health tracking features. Monitor your heart rate, steps, and sleep patterns. Receive notifications and control your music. Water-resistant and long battery life.",
    countInStock: 8,
    category: "Electronics",
  },
  {
    _id: "3",
    name: "Smartphone",
    price: 699.99,
    imageUrl:
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=300",
    rating: 4.8,
    description:
      "Latest model smartphone with high-end camera. Features a powerful processor, large high-resolution screen, and all-day battery life. Take professional-quality photos with the multi-lens camera system.",
    countInStock: 5,
    category: "Electronics",
  },
  {
    _id: "4",
    name: "Laptop",
    price: 1299.99,
    imageUrl:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=300",
    rating: 4.7,
    description:
      "Powerful laptop for work and gaming. Equipped with the latest processor, ample memory, and dedicated graphics card. Thin and light design makes it perfect for professionals on the go.",
    countInStock: 3,
    category: "Electronics",
  },
  {
    _id: "5",
    name: "Bluetooth Speaker",
    price: 79.99,
    imageUrl:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=300",
    rating: 4.0,
    description:
      "Portable Bluetooth speaker with rich sound. Take your music anywhere with this compact yet powerful speaker. Water-resistant design makes it perfect for outdoor use.",
    countInStock: 12,
    category: "Electronics",
  },
  {
    _id: "6",
    name: "Tablet",
    price: 349.99,
    imageUrl:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=300",
    rating: 4.3,
    description:
      "Versatile tablet for entertainment and productivity. High-resolution display is perfect for watching movies or creating content. Compatible with stylus for note-taking and drawing.",
    countInStock: 7,
    category: "Electronics",
  },
];

// Add this constant after the DUMMY_PRODUCTS definition
const CART_STORAGE_KEY = "sreenis_store_cart_items";

type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string; // Optional since API products use images array
  images?: Array<{ url: string; public_id: string; _id: string }>; // Images array from API
  category: string;
  countInStock?: number; // From our dummy data
  stock?: number; // Stock from API
  rating?: number;
  numReviews?: number;
};

export default function ProductScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    // Fetch product from the API
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getById(id as string);

        // The API returns the product directly, not wrapped in a "product" object
        if (response.data && response.data._id) {
          setProduct(response.data);
          setError(null);
        } else {
          // If API doesn't return expected data, try to find product in dummy data as fallback
          const foundProduct = DUMMY_PRODUCTS.find((p) => p._id === id);
          if (foundProduct) {
            setProduct(foundProduct);
            setError(null);
          } else {
            setError("Product not found");
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        // Try to find product in dummy data as fallback
        const foundProduct = DUMMY_PRODUCTS.find((p) => p._id === id);
        if (foundProduct) {
          setProduct(foundProduct);
          setError(null);
        } else {
          setError("Failed to load product details");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      console.log(`Adding ${quantity} of product ${product._id} to cart`);
      console.log(`Product details:`, JSON.stringify(product));

      // Create a simplified version of the product for the cart
      const cartProduct = {
        _id: product._id,
        name: product.name,
        price: product.price,
        imageUrl:
          product.imageUrl ||
          (product.images && product.images.length > 0
            ? product.images[0].url
            : undefined),
      };

      console.log("Simplified product for cart:", JSON.stringify(cartProduct));

      // Try to add to cart via API
      let apiSucceeded = false;
      try {
        const response = await cartAPI.addToCart(product._id, quantity);
        console.log("Add to cart response:", JSON.stringify(response.data));
        apiSucceeded = true;
      } catch (error) {
        console.error("Error adding to cart via API:", error);
        // If API fails, add to local storage
        await addToLocalCart(cartProduct, quantity);
      }

      // Show success message
      Alert.alert("Success", `Added ${quantity} ${product.name} to cart!`, [
        {
          text: "Continue Shopping",
          style: "cancel",
        },
        {
          text: "View Cart",
          onPress: () => {
            // Since route needs to be refreshed completely to show new items, use replace instead of push
            router.replace("/(tabs)/cart");
          },
        },
      ]);
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Still show success message even if API fails (for demo purposes)
      Alert.alert("Success", `Added ${quantity} ${product.name} to cart!`, [
        {
          text: "Continue Shopping",
          style: "cancel",
        },
        {
          text: "View Cart",
          onPress: () => {
            // Since route needs to be refreshed completely to show new items, use replace instead of push
            router.replace("/(tabs)/cart");
          },
        },
      ]);
    } finally {
      setAddingToCart(false);
    }
  };

  // Add a function to handle local cart storage
  const addToLocalCart = async (product: any, quantity: number) => {
    try {
      console.log("Adding to local cart storage");

      // Get existing cart from storage
      let cartItems = [];
      const existingCart = await AsyncStorage.getItem(CART_STORAGE_KEY);

      if (existingCart) {
        cartItems = JSON.parse(existingCart);
      }

      // Check if product already exists in cart
      const existingItemIndex = cartItems.findIndex(
        (item: any) => item.product._id === product._id
      );

      if (existingItemIndex >= 0) {
        // Update quantity if product already exists
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item if product doesn't exist
        cartItems.push({
          product,
          quantity,
        });
      }

      // Save updated cart to storage
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      console.log("Successfully saved to local cart storage");
    } catch (error) {
      console.error("Error adding to local cart:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Product not found"}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Image
        source={{
          uri:
            product.imageUrl ||
            (product.images && product.images.length > 0
              ? product.images[0].url
              : "https://via.placeholder.com/300"),
        }}
        style={styles.productImage}
        resizeMode="cover"
      />

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>

        {product.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} ({product.numReviews || 0} reviews)
            </Text>
          </View>
        )}

        <View style={styles.stockInfo}>
          <Text
            style={[
              styles.stockText,
              {
                color:
                  (product.countInStock || product.stock || 0) > 0
                    ? "green"
                    : "red",
              },
            ]}
          >
            {(product.countInStock || product.stock || 0) > 0
              ? `In Stock (${product.countInStock || product.stock} available)`
              : "Out of Stock"}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.divider} />

        <View style={styles.actionContainer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={20} color="#333" />
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                setQuantity(
                  Math.min(
                    product.countInStock || product.stock || 0,
                    quantity + 1
                  )
                )
              }
              disabled={
                quantity >= (product.countInStock || product.stock || 0)
              }
            >
              <Ionicons name="add" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              {
                opacity:
                  (product.countInStock || product.stock || 0) > 0 &&
                  !addingToCart
                    ? 1
                    : 0.5,
              },
            ]}
            onPress={handleAddToCart}
            disabled={
              (product.countInStock || product.stock || 0) === 0 || addingToCart
            }
          >
            {addingToCart ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addToCartButtonText}>
                {(product.countInStock || product.stock || 0) > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginBottom: 20,
  },
  header: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: 350,
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: "600",
    color: "#0066CC",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    color: "#555",
  },
  stockInfo: {
    marginBottom: 8,
  },
  stockText: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    marginRight: 16,
  },
  quantityButton: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "500",
    minWidth: 30,
    textAlign: "center",
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#0066CC",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  addToCartButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#0066CC",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    minWidth: 120,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
