import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();

  // Default avatar image if user doesn't have a profile picture
  const defaultAvatar =
    "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(user?.name || "User");

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "This feature will be available soon!");
  };

  const handleChangePassword = () => {
    Alert.alert("Change Password", "This feature will be available soon!");
  };

  const handleAddressManagement = () => {
    Alert.alert("Address Management", "This feature will be available soon!");
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      "Notification Settings",
      "This feature will be available soon!"
    );
  };

  const handleLanguage = () => {
    Alert.alert("Language", "This feature will be available soon!");
  };

  const handleAppearance = () => {
    Alert.alert("Appearance", "This feature will be available soon!");
  };

  const handleHelp = () => {
    Alert.alert("Help Center", "This feature will be available soon!");
  };

  const handleAbout = () => {
    Alert.alert("About Us", "This feature will be available soon!");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: user?.profilePicture || defaultAvatar }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "guest@example.com"}
          </Text>
          {user?.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <TouchableOpacity style={styles.option} onPress={handleEditProfile}>
          <Ionicons name="person-outline" size={22} color="#555" />
          <Text style={styles.optionText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={22} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleChangePassword}>
          <Ionicons name="key-outline" size={22} color="#555" />
          <Text style={styles.optionText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={22} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={handleAddressManagement}
        >
          <Ionicons name="location-outline" size={22} color="#555" />
          <Text style={styles.optionText}>Address Management</Text>
          <Ionicons name="chevron-forward" size={22} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={handleNotificationSettings}
        >
          <Ionicons name="notifications-outline" size={22} color="#555" />
          <Text style={styles.optionText}>Notification Settings</Text>
          <Ionicons name="chevron-forward" size={22} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleLanguage}>
          <Ionicons name="globe-outline" size={22} color="#555" />
          <Text style={styles.optionText}>Language</Text>
          <Ionicons name="chevron-forward" size={22} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleAppearance}>
          <Ionicons name="color-palette-outline" size={22} color="#555" />
          <Text style={styles.optionText}>Appearance</Text>
          <Ionicons name="chevron-forward" size={22} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.option} onPress={handleHelp}>
          <Ionicons name="help-circle-outline" size={22} color="#555" />
          <Text style={styles.optionText}>Help Center</Text>
          <Ionicons name="chevron-forward" size={22} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleAbout}>
          <Ionicons name="information-circle-outline" size={22} color="#555" />
          <Text style={styles.optionText}>About Us</Text>
          <Ionicons name="chevron-forward" size={22} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={isLoading}
      >
        <Ionicons name="log-out-outline" size={22} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 6,
    backgroundColor: "#E3F2FD",
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 12,
    color: "#0066CC",
    fontWeight: "500",
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#0066CC",
    borderRadius: 4,
  },
  editButtonText: {
    color: "#0066CC",
    fontSize: 14,
  },
  section: {
    backgroundColor: "white",
    marginTop: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 8,
    marginHorizontal: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3B30",
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 14,
    borderRadius: 8,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
