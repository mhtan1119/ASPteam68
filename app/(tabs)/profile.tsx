import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import vector icons
import { StackScreenProps } from "@react-navigation/stack";

// Define the type for your stack's navigation
type RootStackParamList = {
  profile: undefined;
  editprofile: undefined;
};

// Define the type for the props in ProfilePage
type ProfilePageProps = StackScreenProps<RootStackParamList, "profile">;

export default function ProfilePage({ navigation }: ProfilePageProps) {
  const handleeditprofile = () => {
    // Navigate to the Edit Profile page
    navigation.navigate("editprofile"); // Ensure 'EditProfile' is the correct route name
  };

  return (
    <View className="flex-1 pt-24 px-4 bg-white">
      <View className="flex-row items-center mb-5">
        <Image
          source={{ uri: "https://via.placeholder.com/150" }}
          className="w-20 h-20 rounded-full mr-4"
        />
        <View className="relative">
          <Text className="text-xl font-bold">Hi, User!</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("editprofile")}
            className="mt-2 flex-row items-center"
          >
            <Icon name="arrow-back" size={32} color="#3F5F90" />
          </TouchableOpacity>
        </View>
      </View>
      <Text className="text-lg font-bold my-2">General</Text>
      <TouchableOpacity>
        <Text className="text-base text-gray-500 my-2">Notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text className="text-base text-gray-500 my-2">Accessibility</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text className="text-base text-gray-500 my-2">Theme</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text className="text-base text-gray-500 my-2">
          Emergency Contact Information
        </Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text className="text-base text-[#3F5F90] font-bold my-2">
          Login/Signup
        </Text>
      </TouchableOpacity>
    </View>
  );
}
