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
import {
  HospitalLocation,
  allLocations,
  polyclinics,
  privateHospitals,
  publicHospitals,
} from "@/constants/hospitalData";

// Define the Location interface
interface Location {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  hours: string;
  phone: string; // Add phone number field
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
      <ThemedView style={styles.container}>
        <View style={styles.searchLabelContainer}>
          <Text style={styles.searchLabel}>Search</Text>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchBar}
            placeholder="type name of hospital/polyclinic here"
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
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
        {showDropdown && (
          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item.name}
            style={styles.dropdown}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSelectLocation(item)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          onPanDrag={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(false)}
          onTouchEnd={() => setTimeout(() => setIsDragging(false), 300)}
        >
          {/* Marker for User's Dummy Location */}
          <Marker
            coordinate={{
              latitude: 1.3521, // Central Singapore latitude
              longitude: 103.8198, // Central Singapore longitude
            }}
          >
            <Ionicons name="person-circle" size={40} color="lightblue" />
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
              <Callout style={styles.callout}>
                <View>
                  <Text style={styles.calloutTitle}>{location.name}</Text>
                  <Text style={styles.calloutText}>
                    Address: {location.address}
                  </Text>
                  <Text style={[styles.calloutText, styles.calloutSpacing]}>
                    Opening Hours: {location.hours}
                  </Text>
                  {/* Added button for more info */}
                  <TouchableOpacity
                    style={styles.moreInfoButton}
                    onPress={() => openModal(location)}
                  >
                    <Text style={styles.moreInfoButtonText}>
                      Click for more info
                    </Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
            <Ionicons name="locate-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={zoomIn}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={zoomOut}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
        </View>
        {/* Circular Button to show only Polyclinics */}
        <View style={styles.showPolyclinicsContainer}>
          <TouchableOpacity
            style={styles.showPolyclinicsButton}
            onPress={showPolyclinicsOnly}
          >
            <Ionicons name="medkit-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Polyclinics</Text>
        </View>
        {/* Circular Button to show only Private Hospitals */}
        <View style={styles.showPrivateHospitalsContainer}>
          <TouchableOpacity
            style={styles.showPrivateHospitalsButton}
            onPress={showPrivateHospitalsOnly}
          >
            <Ionicons name="business-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Private Hospitals</Text>
        </View>
        {/* Circular Button to show only Public Hospitals */}
        <View style={styles.showPublicHospitalsContainer}>
          <TouchableOpacity
            style={styles.showPublicHospitalsButton}
            onPress={showPublicHospitalsOnly}
          >
            <Ionicons name="medkit-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Public Hospitals</Text>
        </View>
        {/* Circular Button to Show All Locations */}
        <View style={styles.showAllLocationsContainer}>
          <TouchableOpacity
            style={styles.showAllLocationsButton}
            onPress={showAllLocations}
          >
            <Ionicons name="heart-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>All Locations</Text>
        </View>

        {/* Modal for additional information */}
        {selectedLocation && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{selectedLocation.name}</Text>
                <Text style={styles.modalText}>
                  Address: {selectedLocation.address}
                </Text>
                <Text style={styles.modalText}>
                  Opening Hours: {selectedLocation.hours}
                </Text>
                <Text style={styles.modalText}>
                  Phone: {selectedLocation.phone}
                </Text>
                {/* Add any additional info here */}
              </View>
            </View>
          </Modal>
        )}
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchLabelContainer: {
    marginTop: 120, // Adjust as needed
    left: 10,
    right: 10,
    zIndex: 2,
    alignItems: "flex-start",
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  searchContainer: {
    marginTop: 10, // Adjust as needed to position below the label
    left: 10,
    right: 10,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    height: 40,
    color: "black", // Set the text color to black
  },
  clearButton: {
    width: 30,
    height: 30,
    backgroundColor: "red",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: "white",
  },
  map: {
    flex: 1,
    marginTop: 20, // Start map below the search bar and dropdown
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20, // Moved to the left
    flexDirection: "column",
    gap: 10,
  },
  recenterButton: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 10, // Add margin to separate from zoom in button
  },
  button: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonText: {
    fontSize: 24,
    color: "#000",
  },
  callout: {
    maxWidth: 350,
    padding: 8,
  },
  calloutTitle: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 12,
  },
  calloutText: {
    fontSize: 10,
  },
  calloutSpacing: {
    marginTop: 10,
  },
  moreInfoButton: {
    marginTop: 10,
    backgroundColor: "#2196F3", // Blue background for the button
    padding: 5,
    borderRadius: 5,
  },
  moreInfoButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 12,
  },
  dropdown: {
    marginTop: 10, // Adjust as needed, should be below the search bar
    left: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 8,
    zIndex: 2,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  showPolyclinicsContainer: {
    position: "absolute",
    top: 40, // Position it at the top
    left: 20, // Align it to the left
    justifyContent: "center",
    alignItems: "center",
  },
  showPolyclinicsButton: {
    width: 50,
    height: 50,
    backgroundColor: "#4CAF50", // Green background for the button
    borderRadius: 25, // Circular button
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  showPrivateHospitalsContainer: {
    position: "absolute",
    top: 40, // Position it at the top
    left: 100, // Align it to the left
    justifyContent: "center",
    alignItems: "center",
  },
  showPrivateHospitalsButton: {
    width: 50,
    height: 50,
    backgroundColor: "#FF9800", // Orange background for the button
    borderRadius: 25, // Circular button
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  showPublicHospitalsContainer: {
    position: "absolute",
    top: 40, // Position it at the top
    left: 210, // Align it to the left
    justifyContent: "center",
    alignItems: "center",
  },
  showPublicHospitalsButton: {
    width: 50,
    height: 50,
    backgroundColor: "#2196F3", // Blue background for the button
    borderRadius: 25, // Circular button
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  showAllLocationsContainer: {
    position: "absolute",
    top: 40, // Position it at the top
    left: 315, // Align it to the left
    justifyContent: "center",
    alignItems: "center",
  },
  showAllLocationsButton: {
    width: 50,
    height: 50,
    backgroundColor: "#9C27B0", // Purple background for the button
    borderRadius: 25, // Circular button
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonLabel: {
    marginTop: 5,
    fontSize: 12,
    color: "white",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 10,
  },
});
