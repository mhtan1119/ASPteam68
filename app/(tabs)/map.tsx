import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import { ThemedView } from "@/components/ThemedView";
import Ionicons from "react-native-vector-icons/Ionicons";

// Define the Location interface
interface Location {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  hours: string;
  phone: string;
}

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 1.3521, // Central Singapore latitude
    longitude: 103.8198, // Central Singapore longitude
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef<MapView>(null);

  const zoomIn = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    };
    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 500);
    }
  };

  const zoomOut = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    };
    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 500);
    }
  };

  // Function to recenter the map to the default region
  const recenterMap = () => {
    const defaultRegion = {
      latitude: 1.3521, // Central Singapore latitude
      longitude: 103.8198, // Central Singapore longitude
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    setRegion(defaultRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(defaultRegion, 500);
    }
  };

  // Updated polyclinics with phone numbers
  const polyclinics = [
    {
      name: "Ang Mo Kio Polyclinic",
      latitude: 1.3765,
      longitude: 103.8492,
      address: "723 Ang Mo Kio Ave 8, Singapore 560723",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6355 3000",
    },
    {
      name: "Bedok Polyclinic",
      latitude: 1.3244,
      longitude: 103.9297,
      address: "11 Bedok North St 1, Singapore 469662",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6443 6969",
    },
    {
      name: "Bukit Batok Polyclinic",
      latitude: 1.3481,
      longitude: 103.7543,
      address: "50 Bukit Batok West Ave 3, Singapore 659164",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6563 2233",
    },
    {
      name: "Bukit Merah Polyclinic",
      latitude: 1.2863,
      longitude: 103.8022,
      address: "163 Bukit Merah Central, Singapore 150163",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6274 6111",
    },
    {
      name: "Choa Chu Kang Polyclinic",
      latitude: 1.384,
      longitude: 103.745,
      address: "2 Teck Whye Crescent, Singapore 688846",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6769 3911",
    },
    {
      name: "Clementi Polyclinic",
      latitude: 1.3151,
      longitude: 103.7642,
      address: "451 Clementi Ave 3, Singapore 120451",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6777 2646",
    },
    {
      name: "Geylang Polyclinic",
      latitude: 1.3154,
      longitude: 103.8876,
      address: "21 Geylang East Central, Singapore 389707",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6746 4766",
    },
    {
      name: "Hougang Polyclinic",
      latitude: 1.3721,
      longitude: 103.8942,
      address: "89 Hougang Ave 4, Singapore 538829",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6386 5500",
    },
    {
      name: "Jurong Polyclinic",
      latitude: 1.3356,
      longitude: 103.7044,
      address: "190 Jurong East Ave 1, Singapore 609788",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6665 8600",
    },
    {
      name: "Marine Parade Polyclinic",
      latitude: 1.3031,
      longitude: 103.9075,
      address: "80 Marine Parade Central, Singapore 440080",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6444 6000",
    },
    {
      name: "Outram Polyclinic",
      latitude: 1.2795,
      longitude: 103.8357,
      address: "3 Second Hospital Ave, Singapore 168937",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6321 4355",
    },
    {
      name: "Pasir Ris Polyclinic",
      latitude: 1.3732,
      longitude: 103.9457,
      address: "1 Pasir Ris Dr 4, Singapore 519457",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6585 5400",
    },
    {
      name: "Punggol Polyclinic",
      latitude: 1.4016,
      longitude: 103.9089,
      address: "681 Punggol Dr, Singapore 820681",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6421 4666",
    },
    {
      name: "Queenstown Polyclinic",
      latitude: 1.2949,
      longitude: 103.8013,
      address: "580 Stirling Rd, Singapore 148958",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6471 4533",
    },
    {
      name: "Sengkang Polyclinic",
      latitude: 1.3917,
      longitude: 103.893,
      address: "2 Sengkang Square, Singapore 545025",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6325 7300",
    },
    {
      name: "Tampines Polyclinic",
      latitude: 1.3492,
      longitude: 103.9458,
      address: "1 Tampines St 41, Singapore 529203",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6788 0833",
    },
    {
      name: "Toa Payoh Polyclinic",
      latitude: 1.3324,
      longitude: 103.8496,
      address: "2003 Toa Payoh Lor 8, Singapore 319260",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6354 7666",
    },
    {
      name: "Woodlands Polyclinic",
      latitude: 1.4323,
      longitude: 103.7863,
      address: "10 Woodlands St 31, Singapore 738579",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6363 8811",
    },
    {
      name: "Yishun Polyclinic",
      latitude: 1.4296,
      longitude: 103.8355,
      address: "2 Yishun Ave 9, Singapore 768898",
      hours: "Mon-Fri: 8:00am - 1:00pm, Sat: 8:00am - 12:30pm",
      phone: "+65 6753 5228",
    },
  ];

  // Updated private hospitals with phone numbers
  const privateHospitals = [
    {
      name: "Mount Elizabeth Hospital",
      latitude: 1.3052,
      longitude: 103.835,
      address: "3 Mount Elizabeth, Singapore 228510",
      hours: "24 hours",
      phone: "+65 6737 2666",
    },
    {
      name: "Gleneagles Hospital",
      latitude: 1.3074,
      longitude: 103.8209,
      address: "6A Napier Road, Singapore 258500",
      hours: "24 hours",
      phone: "+65 6473 7222",
    },
    {
      name: "Raffles Hospital",
      latitude: 1.3088,
      longitude: 103.8567,
      address: "585 North Bridge Rd, Singapore 188770",
      hours: "24 hours",
      phone: "+65 6311 1111",
    },
    {
      name: "Mount Alvernia Hospital",
      latitude: 1.3409,
      longitude: 103.8378,
      address: "820 Thomson Road, Singapore 574623",
      hours: "24 hours",
      phone: "+65 6347 6688",
    },
    {
      name: "Parkway East Hospital",
      latitude: 1.3142,
      longitude: 103.9144,
      address: "321 Joo Chiat Pl, Singapore 427990",
      hours: "24 hours",
      phone: "+65 6344 7588",
    },
    {
      name: "Farrer Park Hospital",
      latitude: 1.3125,
      longitude: 103.8521,
      address: "1 Farrer Park Station Rd, Singapore 217562",
      hours: "24 hours",
      phone: "+65 6363 1818",
    },
    {
      name: "Thomson Medical Centre",
      latitude: 1.3196,
      longitude: 103.8431,
      address: "339 Thomson Rd, Singapore 307677",
      hours: "24 hours",
      phone: "+65 6250 2222",
    },
    {
      name: "Mount Elizabeth Novena Hospital",
      latitude: 1.3204,
      longitude: 103.8438,
      address: "38 Irrawaddy Road, Singapore 329563",
      hours: "24 hours",
      phone: "+65 6933 0000",
    },
    {
      name: "East Shore Hospital",
      latitude: 1.3141,
      longitude: 103.9142,
      address: "319 Joo Chiat Pl, Singapore 427989",
      hours: "24 hours",
      phone: "+65 6344 7588",
    },
    {
      name: "Bright Vision Hospital",
      latitude: 1.3713,
      longitude: 103.8883,
      address: "5 Lorong Napiri, Singapore 547530",
      hours: "24 hours",
      phone: "+65 6248 5755",
    },
  ];

  // Updated public hospitals with phone numbers
  const publicHospitals = [
    {
      name: "Singapore General Hospital",
      latitude: 1.2789,
      longitude: 103.8358,
      address: "Outram Rd, Singapore 169608",
      hours: "24 hours",
      phone: "+65 6222 3322",
    },
    {
      name: "Tan Tock Seng Hospital",
      latitude: 1.3214,
      longitude: 103.8454,
      address: "11 Jln Tan Tock Seng, Singapore 308433",
      hours: "24 hours",
      phone: "+65 6256 6011",
    },
    {
      name: "National University Hospital",
      latitude: 1.2932,
      longitude: 103.7831,
      address: "5 Lower Kent Ridge Rd, Singapore 119074",
      hours: "24 hours",
      phone: "+65 6779 5555",
    },
    {
      name: "Changi General Hospital",
      latitude: 1.3416,
      longitude: 103.9462,
      address: "2 Simei Street 3, Singapore 529889",
      hours: "24 hours",
      phone: "+65 6788 8833",
    },
    {
      name: "Khoo Teck Puat Hospital",
      latitude: 1.4245,
      longitude: 103.8383,
      address: "90 Yishun Central, Singapore 768828",
      hours: "24 hours",
      phone: "+65 6555 8000",
    },
    {
      name: "Ng Teng Fong General Hospital",
      latitude: 1.333,
      longitude: 103.743,
      address: "1 Jurong East Street 21, Singapore 609606",
      hours: "24 hours",
      phone: "+65 6716 2000",
    },
    {
      name: "Sengkang General Hospital",
      latitude: 1.3916,
      longitude: 103.8915,
      address: "110 Sengkang E Way, Singapore 544886",
      hours: "24 hours",
      phone: "+65 6930 6000",
    },
    {
      name: "KK Women's and Children's Hospital",
      latitude: 1.3146,
      longitude: 103.8451,
      address: "100 Bukit Timah Road, Singapore 229899",
      hours: "24 hours",
      phone: "+65 6225 5554",
    },
  ];

  const allLocations: Location[] = [
    ...polyclinics,
    ...privateHospitals,
    ...publicHospitals,
  ];

  // Set default filtered locations to all locations on first render
  useEffect(() => {
    setFilteredLocations(allLocations);
  }, []);

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

  const handleScreenPress = () => {
    if (!isDragging) {
      setShowDropdown(false);
      Keyboard.dismiss(); // Closes the keyboard if open
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowDropdown(false);
  };

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

  const openModal = (location: Location) => {
    setSelectedLocation(location);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedLocation(null);
  };

  return (
    <TouchableWithoutFeedback onPress={handleScreenPress}>
      <ThemedView className="flex-1 bg-sky-200">
        <View className="mt-28 mx-2">
          <Text className="text-lg font-bold text-black">Search</Text>
        </View>
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

              // Filter locations based on the search query
              if (text.length > 0) {
                const filtered = allLocations.filter((location) =>
                  location.name.toLowerCase().includes(text.toLowerCase())
                );
                setFilteredLocations(filtered);
              } else {
                setFilteredLocations(allLocations); // Show all locations if search query is empty
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
        <MapView
          ref={mapRef}
          className="flex-1 mt-5"
          region={region}
          onRegionChangeComplete={setRegion}
          onPanDrag={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(false)}
          onTouchEnd={() => setTimeout(() => setIsDragging(false), 300)}
        >
          <Marker
            coordinate={{
              latitude: 1.3521, // Central Singapore latitude
              longitude: 103.8198, // Central Singapore longitude
            }}
          >
            <Ionicons name="person-circle" size={40} color="white" />
          </Marker>

          {filteredLocations.map((location, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={location.name}
            >
              <Callout className="max-w-xs p-2">
                <View>
                  <Text className="font-bold mb-1 text-sm">
                    {location.name}
                  </Text>
                  <Text className="text-xs">Address: {location.address}</Text>
                  <Text className="mt-2 text-xs">
                    Opening Hours: {location.hours}
                  </Text>
                  <TouchableOpacity
                    className="mt-2 bg-blue-500 p-2 rounded-md"
                    onPress={() => openModal(location)}
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

        {/* Circular Button to show only Polyclinics */}
        <View className="absolute top-10 left-5 items-center">
          <TouchableOpacity
            className="w-12 h-12 bg-green-500 rounded-full justify-center items-center shadow-lg"
            onPress={showPolyclinicsOnly}
          >
            <Ionicons name="medkit-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text className="mt-1 text-sm text-black">Polyclinics</Text>
        </View>

        {/* Circular Button to show only Private Hospitals */}
        <View className="absolute top-10 left-24 items-center">
          <TouchableOpacity
            className="w-12 h-12 bg-orange-500 rounded-full justify-center items-center shadow-lg"
            onPress={showPrivateHospitalsOnly}
          >
            <Ionicons name="business-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text className="mt-1 text-sm text-black">Private Hospitals</Text>
        </View>

        {/* Circular Button to show only Public Hospitals */}
        <View className="absolute top-10 left-52 items-center">
          <TouchableOpacity
            className="w-12 h-12 bg-blue-500 rounded-full justify-center items-center shadow-lg"
            onPress={showPublicHospitalsOnly}
          >
            <Ionicons name="medkit-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text className="mt-1 text-sm text-black">Public Hospitals</Text>
        </View>

        {/* Circular Button to Show All Locations */}
        <View className="absolute top-10 left-80 items-center">
          <TouchableOpacity
            className="w-12 h-12 bg-purple-500 rounded-full justify-center items-center shadow-lg"
            onPress={showAllLocations}
          >
            <Ionicons name="heart-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text className="mt-1 text-sm text-black">All Locations</Text>
        </View>

        {/* Modal for additional information */}
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
              </View>
            </View>
          </Modal>
        )}
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}
