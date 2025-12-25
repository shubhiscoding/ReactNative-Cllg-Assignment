import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = "home" | "home-outline" | "flame" | "flame-outline" | "add-circle" | "add-circle-outline" | "person" | "person-outline";

interface TabIconProps {
  name: IconName;
  color: string;
  focused: boolean;
  label: string;
}

function TabIcon({ name, color, focused, label }: TabIconProps) {
  return (
    <View className="items-center justify-center pt-2">
      <Ionicons name={name} size={22} color={color} />
      <Text
        className={`mt-1 ${focused ? "font-bold" : "font-sans"}`}
        style={{ color, fontSize: 10 }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  
  // Calculate tab bar height with safe area
  const tabBarHeight = 60 + insets.bottom;
  const tabBarPaddingBottom = insets.bottom > 0 ? insets.bottom : 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFEF5",
          borderTopWidth: 3,
          borderTopColor: "#1E1E1E",
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
          // Add shadow for Android
          ...(Platform.OS === "android" && {
            elevation: 8,
          }),
        },
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "#6B7280",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              color={color}
              focused={focused}
              label="Feed"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="hot-takes"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "flame" : "flame-outline"}
              color={color}
              focused={focused}
              label="Hot"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create-post"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "add-circle" : "add-circle-outline"}
              color={color}
              focused={focused}
              label="Post"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "person" : "person-outline"}
              color={color}
              focused={focused}
              label="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
}
