// Import necessary modules and components from React and React Native
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps"; // Import MapView components for map display
import { ThemedView } from "@/components/ThemedView"; // Import custom themed view component
import Ionicons from "react-native-vector-icons/Ionicons"; // Import Ionicons for icons
import {
  HospitalLocation,
  allLocations,
  polyclinics,
  privateHospitals,
  publicHospitals,
  services,
} from "@/constants/hospitalData"; // Import hospital data constants
import { useRouter } from "expo-router"; // Import router for navigation

// Define the Location interface
interface Location {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  hours: string;
  phone: string;
  services?: string[];
}

// Main component for the map screen
export default function MapScreen() {
  // State for controlling the region of the map
  const [region, setRegion] = useState<Region>({
    latitude: 1.3521,
    longitude: 103.8198,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [searchQuery, setSearchQuery] = useState(""); // State for search query input
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility
  const [isDragging, setIsDragging] = useState(false); // State to track if the map is being dragged
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]); // State for filtered locations
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  ); // State for the currently selected location
  const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const mapRef = useRef<MapView>(null); // Reference for the map component
  const router = useRouter(); // Hook for navigation

  // Function to zoom in the map
  const zoomIn = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    };
    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 500); // Animate map to new region
    }
  };

  // Function to zoom out the map
  const zoomOut = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    };
    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 500); // Animate map to new region
    }
  };

  // Function to recenter the map to default coordinates
  const recenterMap = () => {
    const defaultRegion = {
      latitude: 1.3521,
      longitude: 103.8198,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    setRegion(defaultRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(defaultRegion, 500); // Animate map to default region
    }
  };

  // Effect to initialize the filtered locations with all locations on component mount
  useEffect(() => {
    setFilteredLocations(allLocations);
  }, []);

  // Function to handle location selection from the dropdown
  const handleSelectLocation = (location: Location) => {
    setRegion({
      ...region,
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setSearchQuery(location.name);
    setShowDropdown(false);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  // Function to handle screen press to hide dropdown and dismiss keyboard
  const handleScreenPress = () => {
    if (!isDragging) {
      setShowDropdown(false);
      Keyboard.dismiss();
    }
  };

  // Function to clear the search input
  const clearSearch = () => {
    setSearchQuery("");
    setShowDropdown(false);
  };

  // Functions to filter locations based on type
  const showPolyclinicsOnly = () => {
    setFilteredLocations(polyclinics);
  };

  const showPublicHospitalsOnly = () => {
    setFilteredLocations(publicHospitals);
  };

  const showPrivateHospitalsOnly = () => {
    setFilteredLocations(privateHospitals);
  };

  const showAllLocations = () => {
    setFilteredLocations(allLocations);
  };

  // Function to get random services for displaying in the modal
  const getRandomServices = (num: number) => {
    const shuffled = [...services].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  };

  // Function to open the modal with selected location details
  const openModal = (location: Location) => {
    const selectedServices = getRandomServices(3);
    setSelectedLocation({ ...location, services: selectedServices });
    setModalVisible(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedLocation(null);
  };

  // Function to handle booking an appointment
  const handleBookAppointment = (locationName: string) => {
    closeModal();
    router.push({
      pathname: "/booking",
      params: {
        locationName,
        clearForm: "true",
      },
    });
  };

  // Component rendering starts here
  return (
    <TouchableWithoutFeedback onPress={handleScreenPress}>
      <ThemedView className="flex-1 bg-customBlue">
        <View className="mt-28 mx-2">
          <Text className="text-lg font-bold text-black">Search</Text>
        </View>
        {/* Search bar */}
        <View className="mt-2 flex-row items-center bg-white rounded-lg p-2 shadow-lg">
          <Ionicons name="search" size={20} color="#888" className="mr-2" />
          <TextInput
            className="flex-1 h-10 text-black"
            placeholder="Type name of hospital/polyclinic here"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowDropdown(true);
              if (text.length > 0) {
                const filtered = allLocations.filter((location) =>
                  location.name.toLowerCase().includes(text.toLowerCase())
                );
                setFilteredLocations(filtered);
              } else {
                setFilteredLocations(allLocations);
              }
            }}
            selectionColor="black"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              className="w-8 h-8 bg-red-500 rounded-full justify-center items-center ml-2"
              onPress={clearSearch}
            >
              <Text className="text-lg text-white">×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dropdown for search results */}
        {showDropdown && (
          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item.name}
            className="mt-2 bg-white rounded-lg shadow-lg max-h-52"
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-2 border-b border-gray-300"
                onPress={() => handleSelectLocation(item)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Map component */}
        <MapView
          ref={mapRef}
          className="flex-1 mt-5"
          region={region}
          onRegionChangeComplete={setRegion}
          onPanDrag={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(false)}
          onTouchEnd={() => setTimeout(() => setIsDragging(false), 300)}
        >
          {/* User's current location marker */}
          <Marker
            coordinate={{
              latitude: 1.3521,
              longitude: 103.8198,
            }}
          >
            <Ionicons name="person-circle" size={40} color="white" />
          </Marker>

          {/* Markers for all filtered locations */}
          {filteredLocations.map((location, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={location.name}
            >
              <Callout
                onPress={() => openModal(location)}
                className="max-w-xs p-2"
              >
                <View>
                  <Text className="font-bold mb-1 text-sm">
                    {location.name}
                  </Text>
                  <Text className="text-xs">Address: {location.address}</Text>
                  <Text className="mt-2 text-xs">
                    Opening Hours: {location.hours}
                  </Text>
                  <TouchableOpacity
                    className="mt-2 bg-customBlue p-2 rounded-md"
                    onPress={() => {}}
                  >
                    <Text className="text-white text-center text-xs">
                      Click for more info
                    </Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        {/* Control buttons for map interaction */}
        <View className="absolute bottom-5 left-5 space-y-2">
          <TouchableOpacity
            className="w-12 h-12 bg-white/80 rounded-full items-center justify-center shadow-lg mb-2"
            onPress={recenterMap}
          >
            <Ionicons name="locate-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-12 h-12 bg-white/80 rounded-full items-center justify-center shadow-lg"
            onPress={zoomIn}
          >
            <Text className="text-2xl text-black">+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-12 h-12 bg-white/80 rounded-full items-center justify-center shadow-lg mt-2"
            onPress={zoomOut}
          >
            <Text className="text-2xl text-black">-</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons for filtering location types */}
        <View className="absolute top-10 left-5 items-center">
          <TouchableOpacity
            className="w-12 h-12 bg-green-500 rounded-full justify-center items-center shadow-lg"
            onPress={showPolyclinicsOnly}
          >
            <Ionicons name="medkit-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text className="mt-1 text-sm text-black">Polyclinics</Text>
        </View>

        <View className="absolute top-10 left-24 items-center">
          <TouchableOpacity
            className="w-12 h-12 bg-orange-500 rounded-full justify-center items-center shadow-lg"
            onPress={showPrivateHospitalsOnly}
          >
            <Ionicons name="business-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text className="mt-1 text-sm text-black">Private Hospitals</Text>
        </View>

        <View className="absolute top-10 left-52 items-center">
          <TouchableOpacity
            className="w-12 h-12 bg-blue-500 rounded-full justify-center items-center shadow-lg"
            onPress={showPublicHospitalsOnly}
          >
            <Ionicons name="medkit-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text className="mt-1 text-sm text-black">Public Hospitals</Text>
        </View>

        <View className="absolute top-10 left-80 items-center">
          <TouchableOpacity
            className="w-12 h-12 bg-purple-500 rounded-full justify-center items-center shadow-lg"
            onPress={showAllLocations}
          >
            <Ionicons name="heart-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text className="mt-1 text-sm text-black">All Locations</Text>
        </View>

        {/* Modal for showing location details */}
        {selectedLocation && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="w-4/5 bg-white rounded-lg p-5 items-center">
                <TouchableOpacity
                  className="absolute top-2 right-2"
                  onPress={closeModal}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-lg font-bold mb-2">
                  {selectedLocation.name}
                </Text>
                <Text className="text-sm mb-2">
                  Address: {selectedLocation.address}
                </Text>
                <Text className="text-sm mb-2">
                  Opening Hours: {selectedLocation.hours}
                </Text>
                <Text className="text-sm mb-2">
                  Phone: {selectedLocation.phone}
                </Text>
                <Text className="text-sm font-bold mt-4">
                  Services Provided:
                </Text>
                {selectedLocation.services &&
                  selectedLocation.services.map((service, index) => (
                    <Text key={index} className="text-sm mb-1">
                      • {service}
                    </Text>
                  ))}
                <TouchableOpacity
                  className="mt-4 bg-customBlue2 p-3 rounded-md flex-row items-center justify-center"
                  onPress={() => handleBookAppointment(selectedLocation?.name)}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="white"
                    className="mr-2"
                  />
                  <Text className="text-white text-center text-sm">
                    Book Appointment
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}
