// Importing the necessary modules and components
import { Tabs } from "expo-router"; // Import Tabs component from expo-router
import React from "react"; // Import the React library
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for icons
import { useColorScheme } from "@/hooks/useColorScheme"; // Import custom hook to get the color scheme

// Define main component for tab layout
export default function TabLayout() {
  // get the current color scheme using custom hook
  const colorScheme = useColorScheme();

  // Return the Tabs component with multiple tab screens
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#8c8c8c", // Color for active tab icon
        tabBarInactiveTintColor: "#FFFFFF", // Color for inactive tab icon
        tabBarStyle: {
          backgroundColor: "#3F5F90", // Background color of the tab bar
        },
        headerShown: false, // Hide the header
      }}
    >
      {/* Define each tab screen with its specific options */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home", // title of the Home screen
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" color={color} size={24} /> // Icon for the Home tab
          ),
        }}
      />
      <Tabs.Screen
        name="medtracking"
        options={{
          title: "Medication", // title of the Medication screen
          tabBarIcon: ({ color }) => (
            <Ionicons name="medkit" color={color} size={24} /> // Icon for the Medication tab
          ),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: "Appointment", // title of the Appointment screen
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" color={color} size={24} /> // Icon for the Appointment tab
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map", // title of the Map screen
          tabBarIcon: ({ color }) => (
            <Ionicons name="map" color={color} size={24} /> // Icon for the Map tab
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile", // title of the Profile screen
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" color={color} size={24} /> // Icon for the Profile tab
          ),
        }}
      />
    </Tabs>
  );
}
