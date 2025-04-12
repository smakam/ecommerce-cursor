import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// We would fetch this from an API in a real app
const PRODUCT_DATA: Record<string, Product> = {
  "1": {
    _id: "1",
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation.",
    price: 99.99,
    inStock: 15,
    sold: 42,
    status: "Active",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400",
    features: [
      "Bluetooth 5.0",
      "Active Noise Cancellation",
      "30-hour battery life",
      "Voice assistant compatible",
    ],
  },
  "2": {
    _id: "2",
    name: "Smart Watch",
    description: "Modern smartwatch with health tracking features.",
    price: 199.99,
    inStock: 8,
    sold: 23,
    status: "Active",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=400",
    features: [
      "Heart rate monitor",
      "Sleep tracking",
      "GPS",
      "Water resistant",
    ],
  },
  "3": {
    _id: "3",
    name: "Smartphone",
    description: "Latest model smartphone with advanced camera system.",
    price: 699.99,
    inStock: 5,
    sold: 18,
    status: "Active",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400",
    features: [
      '6.7" OLED Display',
      "Triple camera system",
      "128GB Storage",
      "Face recognition",
    ],
  },
  "4": {
    _id: "4",
    name: "Laptop",
    description: "Powerful laptop for work and gaming.",
    price: 1299.99,
    inStock: 3,
    sold: 12,
    status: "Low Stock",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=400",
    features: ["Intel Core i7", "16GB RAM", "512GB SSD", "NVIDIA GeForce RTX"],
  },
  "5": {
    _id: "5",
    name: "Bluetooth Speaker",
    description: "Portable bluetooth speaker with amazing sound quality.",
    price: 79.99,
    inStock: 0,
    sold: 31,
    status: "Out of Stock",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=400",
    features: [
      "Waterproof",
      "12-hour battery life",
      "Built-in microphone",
      "Portable design",
    ],
  },
};

type ProductStatus = "Active" | "Low Stock" | "Out of Stock" | "Inactive";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  inStock: number;
  sold: number;
  status: ProductStatus;
  category: string;
  image: string;
  features: string[];
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [editMode, setEditMode] = useState(false);

  // For editing
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [inStock, setInStock] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [feature, setFeature] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      if (
        typeof id === "string" &&
        PRODUCT_DATA[id as keyof typeof PRODUCT_DATA]
      ) {
        const productData = PRODUCT_DATA[id as keyof typeof PRODUCT_DATA];
        setProduct(productData);

        // Initialize form values
        setName(productData.name);
        setDescription(productData.description);
        setPrice(productData.price.toString());
        setInStock(productData.inStock.toString());
        setCategory(productData.category);
        setIsActive(productData.status === "Active");
        setFeatures([...productData.features]);
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const handleSave = () => {
    if (!name || !description || !price) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setSaving(true);

    // Calculate status based on stock and active state
    let status: ProductStatus = "Inactive";
    if (isActive) {
      const stockNum = parseInt(inStock);
      if (stockNum <= 0) {
        status = "Out of Stock";
      } else if (stockNum <= 5) {
        status = "Low Stock";
      } else {
        status = "Active";
      }
    }

    // Simulate API call
    setTimeout(() => {
      const updatedProduct: Product = {
        ...product!,
        name,
        description,
        price: parseFloat(price),
        inStock: parseInt(inStock),
        category,
        status,
        features,
      };

      setProduct(updatedProduct);
      setEditMode(false);
      setSaving(false);

      Alert.alert("Success", "Product updated successfully!");
    }, 1000);
  };

  const handleCancel = () => {
    // Reset form values to original product data
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setInStock(product.inStock.toString());
      setCategory(product.category);
      setIsActive(product.status === "Active");
      setFeatures([...product.features]);
    }
    setEditMode(false);
  };

  const handleAddFeature = () => {
    if (feature.trim()) {
      setFeatures([...features, feature.trim()]);
      setFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Simulate deletion
            Alert.alert("Success", "Product deleted successfully");
            router.back();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#ff3b30" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {editMode ? "Edit Product" : "Product Details"}
        </Text>
        {!editMode && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditMode(true)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {!editMode ? (
          // View Mode
          <>
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
            />

            <Text style={styles.productName}>{product.name}</Text>

            <View style={styles.priceStat}>
              <Text style={styles.priceLabel}>Price:</Text>
              <Text style={styles.priceValue}>${product.price.toFixed(2)}</Text>
            </View>

            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{product.inStock}</Text>
                <Text style={styles.statLabel}>In Stock</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{product.sold}</Text>
                <Text style={styles.statLabel}>Sold</Text>
              </View>
              <View style={styles.stat}>
                <Text
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        product.status === "Active"
                          ? "#dcf8c6"
                          : product.status === "Low Stock"
                          ? "#ffe0b2"
                          : "#ffcdd2",
                    },
                  ]}
                >
                  {product.status}
                </Text>
                <Text style={styles.statLabel}>Status</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionContent}>{product.description}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Text style={styles.sectionContent}>{product.category}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              {product.features.map((feature, index) => (
                <Text key={index} style={styles.featureItem}>
                  • {feature}
                </Text>
              ))}
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={18} color="white" />
              <Text style={styles.deleteButtonText}>Delete Product</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Edit Mode
          <>
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
            />

            <TouchableOpacity style={styles.changeImageButton}>
              <Ionicons name="camera-outline" size={20} color="white" />
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Product Name*</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Product name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description*</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Product description"
                multiline
                textAlignVertical="top"
                numberOfLines={4}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Price*</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Stock</Text>
                <TextInput
                  style={styles.input}
                  value={inStock}
                  onChangeText={setInStock}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="Product category"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: "#d1d1d1", true: "#bae6fd" }}
                  thumbColor={isActive ? "#0066CC" : "#f4f3f4"}
                />
              </View>
              <Text style={styles.helperText}>
                {isActive
                  ? "Product will be visible to customers"
                  : "Product will be hidden from customers"}
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Features</Text>
              {features.map((item, index) => (
                <View key={index} style={styles.featureRow}>
                  <Text style={styles.featureText}>{item}</Text>
                  <TouchableOpacity onPress={() => handleRemoveFeature(index)}>
                    <Ionicons name="close-circle" size={20} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.addFeatureRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  value={feature}
                  onChangeText={setFeature}
                  placeholder="Add a feature"
                />
                <TouchableOpacity
                  style={styles.addFeatureButton}
                  onPress={handleAddFeature}
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backIcon: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#e1f5fe",
  },
  editButtonText: {
    color: "#0066CC",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  productImage: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  priceStat: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: "600",
    color: "#0066CC",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 8,
    padding: 16,
  },
  stat: {
    alignItems: "center",
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 14,
    fontWeight: "500",
    overflow: "hidden",
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 20,
    color: "#333",
  },
  featureItem: {
    fontSize: 15,
    marginBottom: 4,
    paddingLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 8,
  },
  featureText: {
    flex: 1,
  },
  addFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  addFeatureButton: {
    backgroundColor: "#0066CC",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#0066CC",
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
  },
  changeImageButton: {
    position: "absolute",
    right: 24,
    top: 24,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeImageText: {
    color: "white",
    marginLeft: 4,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    marginVertical: 16,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#0066CC",
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
