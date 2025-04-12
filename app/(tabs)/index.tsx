import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { productsAPI } from "../../src/api";

// Dummy product data for testing
const DUMMY_PRODUCTS = [
  {
    _id: "1",
    name: "Wireless Headphones",
    price: 99.99,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300",
    rating: 4.5,
    description: "High-quality wireless headphones with noise cancellation.",
  },
  {
    _id: "2",
    name: "Smart Watch",
    price: 199.99,
    imageUrl:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=300",
    rating: 4.2,
    description: "Smart watch with health tracking features.",
  },
  {
    _id: "3",
    name: "Smartphone",
    price: 699.99,
    imageUrl:
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=300",
    rating: 4.8,
    description: "Latest model smartphone with high-end camera.",
  },
  {
    _id: "4",
    name: "Laptop",
    price: 1299.99,
    imageUrl:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=300",
    rating: 4.7,
    description: "Powerful laptop for work and gaming.",
  },
  {
    _id: "5",
    name: "Bluetooth Speaker",
    price: 79.99,
    imageUrl:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=300",
    rating: 4.0,
    description: "Portable Bluetooth speaker with rich sound.",
  },
  {
    _id: "6",
    name: "Tablet",
    price: 349.99,
    imageUrl:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=300",
    rating: 4.3,
    description: "Versatile tablet for entertainment and productivity.",
  },
];

type Product = {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string; // Optional since API products use images array
  images?: Array<{ url: string; public_id: string; _id: string }>; // Images array from API
  rating?: number;
  description: string;
  stock?: number; // From API
  countInStock?: number; // From our dummy data
};

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();

        // The API returns an array of products directly, not wrapped in a "products" object
        if (response.data && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          // Fallback to dummy data if the API response is not as expected
          console.warn("API response format unexpected, using fallback data");
          setProducts(DUMMY_PRODUCTS);
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(
          "Failed to load products from the server. Using sample data instead."
        );
        // Fallback to dummy data on error
        setProducts(DUMMY_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = () => {
    // If connected to backend, this would ideally call the API with the search term
    if (!searchQuery.trim()) {
      fetchProducts(); // Refresh from API when search is cleared
      return;
    }

    // For now, filter the current products (whether from API or dummy data)
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setProducts(filtered);
  };

  // Helper function to get products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();

      // The API returns an array of products directly, not wrapped in a "products" object
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        // Fallback to dummy data if the API response is not as expected
        setProducts(DUMMY_PRODUCTS);
      }

      setError(null);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback to dummy data on error
      setProducts(DUMMY_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    // Get the image URL - either from imageUrl property or from the first image in the images array
    const imageSource =
      item.imageUrl ||
      (item.images && item.images.length > 0
        ? item.images[0].url
        : "https://via.placeholder.com/150");

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/product/${item._id}`)}
      >
        <Image
          source={{ uri: imageSource }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {item.rating ? item.rating.toFixed(1) : "New"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Discover Products</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#777"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setProducts(DUMMY_PRODUCTS)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.productList}
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
    padding: 16,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  productList: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    height: 150,
    width: "100%",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0066CC",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#555",
  },
});
