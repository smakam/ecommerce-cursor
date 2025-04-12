import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { api } from "../../src/api";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await api.get("/auth/current-user");
        if (response.data && response.data.role) {
          setUserRole(response.data.role);
        }
      } catch (error) {
        console.error("Error fetching user info", error);
      }
    };

    getUserInfo();
  }, []);

  // Determine if seller tab should be shown
  const showSellerTab = userRole === "seller";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === "dark" ? "#fff" : "#0066CC",
        tabBarInactiveTintColor: "#888",
      }}
    >
      {/* Main visible tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="shopping-cart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="shopping-bag" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />

      {/* Seller routes - only the main tab is conditionally shown based on user role */}
      <Tabs.Screen
        name="seller/index"
        options={{
          title: "Seller",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="briefcase" color={color} />
          ),
          href: showSellerTab ? undefined : null,
        }}
      />

      {/* Other seller routes are always hidden from tab bar but remain navigable */}
      <Tabs.Screen
        name="seller/orders"
        options={{
          href: null, // Hidden from tab bar
        }}
      />
      <Tabs.Screen
        name="seller/product/[id]"
        options={{
          href: null, // Hidden from tab bar
        }}
      />
      <Tabs.Screen
        name="seller/product/add"
        options={{
          href: null, // Hidden from tab bar
        }}
      />
    </Tabs>
  );
}
