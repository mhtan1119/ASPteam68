import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#8c8c8c", // Set active tint color to gray
        tabBarInactiveTintColor: "#FFFFFF", // Set inactive tint color to white
        tabBarStyle: {
          backgroundColor: "#3F5F90", // Set the background color to your desired color
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="home"
              color={color} // Use the color prop for consistency with the tint colors
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="medtracking"
        options={{
          title: "Medication",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="medkit"
              color={color} // Use the color prop for consistency with the tint colors
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: "Appointment",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="calendar"
              color={color} // Use the color prop for consistency with the tint colors
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="map"
              color={color} // Use the color prop for consistency with the tint colors
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="person"
              color={color} // Use the color prop for consistency with the tint colors
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
