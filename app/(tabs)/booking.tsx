// Import necessary modules and components from React and React Native
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  SafeAreaView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import Picker for dropdowns
import RadioForm from "react-native-simple-radio-button"; // Import RadioForm for radio buttons
import DateTimePicker from "@react-native-community/datetimepicker"; // Import DateTimePicker for date selection
import { styled } from "nativewind"; // Import styled components for Tailwind-like styling
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage for local data storage
import {
  SQLiteBindParams,
  SQLiteProvider,
  useSQLiteContext,
} from "expo-sqlite"; // Import SQLite components for local database management
import {
  HospitalLocation,
  allLocations,
  polyclinics,
  privateHospitals,
  publicHospitals,
  services,
} from "@/constants/hospitalData"; // Import data constants
import { useRouter, useLocalSearchParams } from "expo-router"; // Import routing hooks
import { useFocusEffect } from "@react-navigation/native"; // Import hook for detecting screen focus

// Define styled components for consistent styling
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledView = styled(View);

// Function to initialize the local SQLite database
const initializeDatabase = async (db: any) => {
  try {
    // Create appointments table if it doesn't exist
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service TEXT,
        location TEXT,
        date TEXT,
        time TEXT,
        remarks TEXT
      );`
    );
    console.log("Database initialized!");
  } catch (error) {
    console.log("Error while initializing the database:", error);
  }
};

// Main App component, providing the SQLite context
export default function App() {
  return (
    <SQLiteProvider databaseName="data.db" onInit={initializeDatabase}>
      <Main />
    </SQLiteProvider>
  );
}

// Main component to manage app navigation between booking and viewing appointments
function Main() {
  const [showBookedAppointments, setShowBookedAppointments] = useState(true); // State to show or hide booked appointments

  // Conditional rendering based on the state
  return showBookedAppointments ? (
    <BookedAppointments onClose={() => setShowBookedAppointments(false)} />
  ) : (
    <Booking onBack={() => setShowBookedAppointments(true)} />
  );
}

// Component for making a new booking
function Booking({ onBack }: { onBack: any }) {
  // Access SQLite database context
  const db = useSQLiteContext();
  const router = useRouter(); // Router hook for navigation

  // Retrieve passed parameters from previous screens
  const {
    location: passedLocation,
    service: passedService,
    locationName,
    date: passedDate,
    time: passedTime,
    remarks: passedRemarks,
    clearForm,
  } = useLocalSearchParams();

  const [userName, setUserName] = useState(""); // State for storing the user's name

  // Fetch the user's name whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchUserName = async () => {
        try {
          const profileData = await AsyncStorage.getItem("userProfile");
          if (profileData) {
            const data = JSON.parse(profileData);
            setUserName(data.fullName || "");
          }
        } catch (error) {
          console.error("Error fetching user name:", error);
        }
      };

      fetchUserName();
    }, [])
  );

  // Get all location names from the data constants
  const healthcareFacilityNames = allLocations.map((location) => location.name);

  // Generate time options for the appointment timeslot picker
  const timeOptions = [];
  for (let h = 8; h <= 17; h++) {
    for (let m = 0; m < 60; m += 15) {
      let hour = h < 10 ? `0${h}` : h;
      let minute = m === 0 ? "00" : m;
      timeOptions.push(`${hour}:${minute}`);
    }
  }
  timeOptions.push("18:00");

  // States for various appointment details
  const [service, setService] = useState(passedService || "");
  const [location, setLocation] = useState(locationName || "");
  const [date, setDate] = useState(
    passedDate
      ? new Date(Array.isArray(passedDate) ? passedDate[0] : passedDate)
      : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(passedTime || "");
  const [remarks, setRemarks] = useState(passedRemarks || "");
  const [symptoms, setSymptoms] = useState(0);
  const [allergy, setAllergy] = useState(0);
  const [allergyDetails, setAllergyDetails] = useState("");

  // States to manage the visibility of modal dialogs
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);

  // Temporary states for selecting options in modals
  const [tempService, setTempService] = useState(service);
  const [tempLocation, setTempLocation] = useState(location);
  const [tempTime, setTempTime] = useState(time);

  // Effect to update state when passed parameters change
  useEffect(() => {
    if (locationName) setLocation(locationName);
    if (passedService) setService(passedService);
    if (passedLocation) setLocation(passedLocation);
    if (passedDate) {
      const dateValue = Array.isArray(passedDate) ? passedDate[0] : passedDate;
      setDate(new Date(dateValue));
    }
    if (passedTime) setTime(passedTime);
    if (passedRemarks) setRemarks(passedRemarks);
  }, [passedService, locationName, passedDate, passedTime, passedRemarks]);

  // Effect to clear form or reset states when instructed
  useEffect(() => {
    if (clearForm) {
      setService("");
      setDate(new Date());
      setTime("");
      setRemarks("");
      setSymptoms(0);
      setAllergy(0);
      setAllergyDetails("");
    }
    if (locationName) setLocation(locationName);
  }, [clearForm, locationName]);

  const radio_props = [
    { label: "Yes", value: 1 },
    { label: "No", value: 0 },
  ];

  // Handler to confirm service selection
  const handleServiceSelect = () => {
    setService(tempService);
    setServiceModalVisible(false);
  };

  // Effect to update appointment details on focus
  useFocusEffect(
    useCallback(() => {
      if (locationName) setLocation(locationName);
      if (passedService) setService(passedService);
      if (passedLocation) setLocation(passedLocation);
      if (passedDate) {
        const dateValue = Array.isArray(passedDate)
          ? passedDate[0]
          : passedDate;
        setDate(new Date(dateValue));
      }
      if (passedTime) setTime(passedTime);
      if (passedRemarks) setRemarks(passedRemarks);
    }, [locationName, passedService, passedDate, passedTime, passedRemarks])
  );

  // Handlers for selecting location and time
  const handleLocationSelect = () => {
    setLocation(tempLocation);
    setLocationModalVisible(false);
  };

  const handleTimeSelect = () => {
    setTime(tempTime);
    setTimeModalVisible(false);
  };

  // Handler for date change in DateTimePicker
  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight to avoid time comparison issues

    if (currentDate >= today) {
      // Ensure the selected date is today or a future date
      setDate(currentDate);
    } else {
      Alert.alert("Invalid Date", "You cannot select a past date.");
    }

    setShowDatePicker(Platform.OS === "ios");
  };

  // Handler to save appointment details to the local database
  const handleSaveAppointment = async () => {
    if (!service || !location || !date || !time) {
      Alert.alert("Error", "Please fill in all the fields.");
      return;
    }

    // Normalize the date to avoid time zone issues
    const normalizedDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    try {
      await db.runAsync(
        "INSERT INTO appointments (service, location, date, time, remarks) VALUES (?, ?, ?, ?, ?);",
        [service, location, normalizedDate, time, remarks] as SQLiteBindParams
      );
      Alert.alert("Success", "Appointment saved successfully.");
    } catch (error) {
      console.log("Error saving appointment:", error);
    }
  };

  // Component rendering starts here
  return (
    <StyledSafeAreaView className="flex-1 bg-gray-100">
      <StyledScrollView className="p-5">
        <StyledText className="text-2xl font-bold mb-5 text-center bg-customBlue2 text-white py-3 rounded">
          APPOINTMENTS
        </StyledText>

        {/* Display user's name */}
        <StyledText className="text-lg font-semibold mb-4">
          Name: {userName}
        </StyledText>

        {/* Service selection */}
        <StyledText className="font-bold mb-2">Services</StyledText>
        <StyledTouchableOpacity
          className="h-10 border border-gray-300 rounded justify-center px-2 mb-4 bg-white"
          onPress={() => setServiceModalVisible(true)}
        >
          <StyledText className="text-gray-800">
            {service ? service : "Select your service"}
          </StyledText>
        </StyledTouchableOpacity>

        {/* Modal for service selection */}
        <Modal visible={serviceModalVisible} animationType="slide">
          <StyledView className="flex-1 justify-center p-5">
            <Picker
              selectedValue={tempService}
              onValueChange={(itemValue) => setTempService(itemValue)}
            >
              {services.map((serviceItem, index) => (
                <Picker.Item
                  label={serviceItem}
                  value={serviceItem}
                  key={index}
                />
              ))}
            </Picker>
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded mt-4"
              onPress={handleServiceSelect}
            >
              <StyledText className="text-white text-center">Select</StyledText>
            </StyledTouchableOpacity>
            <StyledTouchableOpacity
              className="bg-red-500 p-2 rounded mt-2"
              onPress={() => setServiceModalVisible(false)}
            >
              <StyledText className="text-white text-center">Cancel</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </Modal>

        {/* Location selection */}
        <StyledText className="font-bold mb-2">Location</StyledText>
        <StyledTouchableOpacity
          className="h-10 border border-gray-300 rounded justify-center px-2 mb-4 bg-white"
          onPress={() => setLocationModalVisible(true)}
        >
          <StyledText className="text-gray-800">
            {location ? location : "Select hospital or polyclinic"}
          </StyledText>
        </StyledTouchableOpacity>

        {/* Modal for location selection */}
        <Modal visible={locationModalVisible} animationType="slide">
          <StyledView className="flex-1 justify-center p-5">
            <Picker
              selectedValue={tempLocation}
              onValueChange={(itemValue) => setTempLocation(itemValue)}
            >
              {healthcareFacilityNames.map((facility, index) => (
                <Picker.Item label={facility} value={facility} key={index} />
              ))}
            </Picker>
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded mt-4"
              onPress={handleLocationSelect}
            >
              <StyledText className="text-white text-center">Select</StyledText>
            </StyledTouchableOpacity>
            <StyledTouchableOpacity
              className="bg-red-500 p-2 rounded mt-2"
              onPress={() => setLocationModalVisible(false)}
            >
              <StyledText className="text-white text-center">Cancel</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </Modal>

        {/* Date selection */}
        <StyledText className="font-bold mb-2">Date</StyledText>
        <StyledTouchableOpacity
          className="h-10 border border-gray-300 rounded justify-center px-2 mb-4 bg-white"
          onPress={() => setShowDatePicker(true)}
        >
          <StyledText className="text-gray-800">
            {date.toLocaleDateString() || "Select date"}
          </StyledText>
        </StyledTouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            minimumDate={new Date()} // Prevent selection of past dates
            onChange={handleDateChange}
          />
        )}

        {/* Time selection */}
        <StyledText className="font-bold mb-2">Time</StyledText>
        <StyledTouchableOpacity
          className="h-10 border border-gray-300 rounded justify-center px-2 mb-4 bg-white"
          onPress={() => setTimeModalVisible(true)}
        >
          <StyledText className="text-gray-800">
            {time ? time : "Select time"}
          </StyledText>
        </StyledTouchableOpacity>

        {/* Modal for time selection */}
        <Modal visible={timeModalVisible} animationType="slide">
          <StyledView className="flex-1 justify-center p-5">
            <Picker
              selectedValue={tempTime}
              onValueChange={(itemValue) => setTempTime(itemValue)}
            >
              {timeOptions.map((timeOption, index) => (
                <Picker.Item
                  label={timeOption}
                  value={timeOption}
                  key={index}
                />
              ))}
            </Picker>
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded mt-4"
              onPress={handleTimeSelect}
            >
              <StyledText className="text-white text-center">Select</StyledText>
            </StyledTouchableOpacity>
            <StyledTouchableOpacity
              className="bg-red-500 p-2 rounded mt-2"
              onPress={() => setTimeModalVisible(false)}
            >
              <StyledText className="text-white text-center">Cancel</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </Modal>

        {/* Remarks input field */}
        <StyledText className="font-bold mb-2">Remarks</StyledText>
        <StyledTextInput
          placeholder="Remarks"
          className="h-10 border border-gray-300 rounded px-2 mb-4 bg-white"
          value={remarks.toString()}
          onChangeText={(text) => setRemarks(text)}
        />

        {/* Symptom selection with radio buttons */}
        <StyledText className="font-bold mb-2">
          Do you have any of the following symptoms:
        </StyledText>
        <StyledText className="mb-2">
          Fever, Cough, Sore Throat, Runny Nose
        </StyledText>
        <RadioForm
          radio_props={radio_props}
          initial={0}
          onPress={(value) => setSymptoms(value)}
          formHorizontal={true}
          labelHorizontal={true}
          buttonColor={"#83B4FF"}
          animation={true}
        />

        {/* Allergy selection with radio buttons */}
        <StyledText className="font-bold mb-2 mt-4">
          Any drug allergy?
        </StyledText>
        <RadioForm
          radio_props={radio_props}
          initial={0}
          onPress={(value) => setAllergy(value)}
          formHorizontal={true}
          labelHorizontal={true}
          buttonColor={"#83B4FF"}
          animation={true}
        />

        {/* Input field for allergy details if 'Yes' is selected */}
        {allergy === 1 && (
          <StyledTextInput
            placeholder="If yes, please state the details"
            className="h-10 border border-gray-300 rounded px-2 mb-4 bg-white"
            value={allergyDetails}
            onChangeText={(text) => setAllergyDetails(text)}
          />
        )}

        {/* Button to save appointment */}
        <StyledTouchableOpacity
          className="bg-customBlue py-2 rounded mt-5"
          onPress={handleSaveAppointment}
        >
          <StyledText className="text-white text-center text-lg">
            Submit
          </StyledText>
        </StyledTouchableOpacity>

        {/* Button to go back to booked appointments */}
        <StyledTouchableOpacity
          className="bg-customBlue2 py-2 rounded mt-5"
          onPress={onBack}
        >
          <StyledText className="text-white text-center text-lg">
            Back to Booked Appointments
          </StyledText>
        </StyledTouchableOpacity>

        <StyledView className="h-12" />
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}

// Component to display booked appointments
const BookedAppointments = ({ onClose }: { onClose: any }) => {
  const db = useSQLiteContext(); // Access SQLite database context
  const [appointments, setAppointments] = useState<any[]>([]); // State to store fetched appointments

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch appointments from the local SQLite database
  const fetchAppointments = async () => {
    try {
      const result = await db.getAllSync(
        `SELECT * FROM appointments 
        ORDER BY date(date) ASC, time(time) ASC;`
      );
      setAppointments(result);
    } catch (error) {
      console.log("Error fetching appointments:", error);
    }
  };

  // Function to delete an appointment
  const deleteAppointment = async (id: number) => {
    try {
      await db.runAsync("DELETE FROM appointments WHERE id = ?;", [id]);
      Alert.alert("Success", "Appointment deleted successfully.");
      fetchAppointments(); // Refresh the list after deletion
    } catch (error) {
      console.log("Error deleting appointment:", error);
    }
  };

  // Confirmation dialog for deleting an appointment
  const confirmDeleteAppointment = (id: number) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this appointment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAppointment(id),
        },
      ],
      { cancelable: true }
    );
  };

  // Component rendering for booked appointments
  return (
    <StyledSafeAreaView className="flex-1 bg-gray-100">
      <StyledScrollView className="p-5">
        <StyledText className="text-2xl font-bold mb-5 text-center bg-customBlue2 text-white py-3 rounded">
          Booked Appointments
        </StyledText>

        {appointments.length > 0 ? (
          appointments.map((appointment, index) => (
            <StyledView
              key={index}
              className="mb-4 p-4 border rounded-lg bg-customBlue relative"
            >
              {/* X button to delete the appointment with confirmation */}
              <TouchableOpacity
                className="absolute top-2 right-2"
                onPress={() => confirmDeleteAppointment(appointment.id)}
              >
                <StyledText className="text-white text-lg">✖️</StyledText>
              </TouchableOpacity>

              {/* Display appointment details */}
              <StyledText className="font-bold mb-2">
                Service: {appointment.service}
              </StyledText>
              <StyledText className="mb-2">
                Location: {appointment.location}
              </StyledText>
              <StyledText className="mb-2">Date: {appointment.date}</StyledText>
              <StyledText className="mb-2">Time: {appointment.time}</StyledText>
              <StyledText className="mb-2">
                Remarks: {appointment.remarks}
              </StyledText>
            </StyledView>
          ))
        ) : (
          <StyledText className="text-center text-gray-500">
            No booked appointments found.
          </StyledText>
        )}

        {/* Button to make a new appointment */}
        <StyledTouchableOpacity
          className="bg-customBlue py-2 rounded mt-5"
          onPress={onClose}
        >
          <StyledText className="text-white text-center text-lg">
            Make a New Appointment
          </StyledText>
        </StyledTouchableOpacity>

        <StyledView className="h-12" />
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};
