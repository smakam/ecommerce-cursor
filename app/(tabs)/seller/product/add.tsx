import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

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

export default function AddProductScreen() {
  const [loading, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [inStock, setInStock] = useState("10"); // Default value
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [feature, setFeature] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("https://via.placeholder.com/400");

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

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a product name");
      return false;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please enter a product description");
      return false;
    }

    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return false;
    }

    if (!inStock.trim() || isNaN(parseInt(inStock))) {
      Alert.alert("Error", "Please enter a valid stock quantity");
      return false;
    }

    if (!category.trim()) {
      Alert.alert("Error", "Please enter a product category");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    // Determine product status
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

    // Create a new product object
    const newProduct: Omit<Product, "_id"> = {
      name,
      description,
      price: parseFloat(price),
      inStock: parseInt(inStock),
      sold: 0, // New product has 0 sales
      status,
      category,
      image: imageUrl,
      features,
    };

    // Simulate API call to save product
    setTimeout(() => {
      setSaving(false);
      Alert.alert("Success", "Product added successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Product</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.imagePickerContainer}
          onPress={() =>
            Alert.alert(
              "Feature Coming Soon",
              "Image upload feature will be available in future updates."
            )
          }
        >
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={50} color="#ccc" />
            <Text style={styles.imagePlaceholderText}>
              Tap to add product image
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name*</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter product name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description*</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter product description"
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
            <Text style={styles.label}>Initial Stock*</Text>
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
          <Text style={styles.label}>Category*</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Electronics, Clothing, etc."
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
              disabled={!feature.trim()}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Product</Text>
            </>
          )}
        </TouchableOpacity>
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
    marginRight: 28, // To center the title accounting for the back button
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imagePickerContainer: {
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: "#666",
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
  saveButton: {
    backgroundColor: "#0066CC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
});
