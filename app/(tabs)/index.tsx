// Import necessary modules and components from React and React Native
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import {
  useFocusEffect,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native"; // Import navigation hooks
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"; // Import SQLite components for local database management
import { styled } from "nativewind"; // Import styled components for Tailwind-like styling
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage for local data storage
import { StatusBar } from "expo-status-bar"; // Import StatusBar for handling status bar styling
import Checkbox from "expo-checkbox"; // Import Checkbox component
import moment from "moment"; // Import moment for date handling

// Define the type for navigation stack parameters
type RootStackParamList = {
  booking: undefined; // Add more routes as needed
  medtracking: undefined;
};

// Define styled components for consistent styling
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Main component for the user list screen
const UserListScreen: React.FC = () => {
  const db = useSQLiteContext(); // Access SQLite database context
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Hook for navigation

  // State for storing the next appointment details
  const [nextAppointment, setNextAppointment] = useState<{
    service: string | number | (string | number)[] | null | undefined;
    location: string | number | (string | number)[] | null | undefined;
    remarks: string | number | (string | number)[] | null | undefined;
    date: string;
    time: string;
  } | null>(null);

  const [isVisible, setIsVisible] = useState(true); // State for controlling visibility of the next appointment notification
  const [modalVisible, setModalVisible] = useState(false); // State for controlling the visibility of the modal
  const [medications, setMedications] = useState<
    {
      id: number;
      name: string;
      dosageStrength: number;
      unit: string;
      dosageForm: string;
      time: string;
      status: string; // Status field for medication
    }[]
  >([]); // State for storing today's medications

  const [recentlyTakenPills, setRecentlyTakenPills] = useState<
    {
      id: number;
      name: string;
      dosageStrength: number;
      unit: string;
      dosageForm: string;
      time: string;
      date: string;
      status: string; // Status field for recently taken pills
    }[]
  >([]); // State for storing the recently taken pills that are ticked

  // State for storing user profile information
  const [userProfile, setUserProfile] = useState<{
    age: number;
    allergies: string;
    bloodType: string;
    height: string;
    weight: string;
  } | null>(null);

  const [currentDateTime, setCurrentDateTime] = useState<string>(""); // State for storing the current date and time

  // Function to fetch the next appointment from the local SQLite database
  const fetchAppointments = async () => {
    try {
      const result = await db.getAllAsync(
        "SELECT service, location, date, time, remarks FROM appointments ORDER BY date ASC, time ASC LIMIT 1;"
      );
      const appointmentList = result.map((row: any) => ({
        service: row.service,
        location: row.location,
        date: row.date,
        time: row.time,
        remarks: row.remarks,
      }));

      if (appointmentList.length > 0) {
        setNextAppointment(appointmentList[0]); // Set the next appointment if found
      } else {
        setNextAppointment(null); // Clear the appointment if no future appointments are found
      }
    } catch (error) {
      console.log("Error fetching appointments:", error);
    }
  };

  // Function to fetch today's medications from the local SQLite database
  const fetchTodaysMedications = async () => {
    try {
      const today = moment().format("dddd"); // Get the day in text format (e.g., "Monday")
      const result: {
        id: number;
        name: string;
        dosageStrength: number;
        unit: string;
        dosageForm: string;
        time: string;
        status: string;
      }[] = await db.getAllAsync(
        "SELECT id, name, dosageStrength, unit, dosageForm, time, status FROM medications WHERE date = ? ORDER BY time ASC;",
        [today]
      );
      setMedications(result);
    } catch (error) {
      console.log("Error fetching today's medications:", error);
    }
  };

  // Function to fetch recently taken pills from the local SQLite database
  const fetchRecentlyTakenPills = async () => {
    try {
      const result: {
        id: number;
        name: string;
        dosageStrength: number;
        unit: string;
        dosageForm: string;
        time: string;
        date: string;
        status: string;
      }[] = await db.getAllAsync(
        "SELECT id, name, dosageStrength, unit, dosageForm, time, date, status FROM medications WHERE status = 'tick' ORDER BY time ASC;"
      );
      setRecentlyTakenPills(result);
    } catch (error) {
      console.log("Error fetching recently taken pills:", error);
    }
  };

  // Function to calculate the user's age based on their date of birth
  const calculateAge = (dob: Date) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Function to fetch the user's profile from AsyncStorage
  const fetchUserProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem("userProfile");
      if (profileData) {
        const data = JSON.parse(profileData);
        const age = calculateAge(new Date(data.dateOfBirth)); // Calculate age based on the date of birth
        setUserProfile({
          age,
          allergies: data.allergies || "N/A",
          bloodType: data.bloodType || "N/A",
          height: data.height || "N/A",
          weight: data.weight || "N/A",
        });
      }
    } catch (error) {
      console.log("Error fetching user profile:", error);
    }
  };

  // Function to toggle the status of a medication between tick, cross, and empty
  const toggleMedicationStatus = async (id: number, currentStatus: string) => {
    const newStatus =
      currentStatus === "tick"
        ? "cross"
        : currentStatus === "cross"
        ? ""
        : "tick";
    try {
      await db.runAsync("UPDATE medications SET status = ? WHERE id = ?;", [
        newStatus,
        id,
      ]);
      // Update the local state
      setMedications((prevMedications) =>
        prevMedications.map((medication) =>
          medication.id === id
            ? { ...medication, status: newStatus }
            : medication
        )
      );
    } catch (error) {
      console.log("Error updating medication status:", error);
    }
  };

  // Effect to run when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAppointments(); // Fetch next appointment
      fetchTodaysMedications(); // Fetch today's medications
      fetchRecentlyTakenPills(); // Fetch recently taken pills
      fetchUserProfile(); // Fetch user profile
    }, [])
  );

  // Effect to update the current date and time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString());
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  const handleClose = () => {
    setIsVisible(false); // Close the next appointment notification
  };

  const handleShowModal = () => {
    setModalVisible(true); // Show the appointment details modal
  };

  const handleCloseModal = () => {
    setModalVisible(false); // Close the appointment details modal
  };

  // Component rendering starts here
  return (
    <StyledView className="flex-1 flex-col py-10 bg-white">
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}>
        {isVisible && nextAppointment && (
          <StyledView className="absolute top-0 left-0 right-0 bg-customBeige p-4 rounded-b-xl flex-row items-center z-60">
            <StyledText className="text-red-600 text-xl mr-2">⚠️</StyledText>
            <StyledText className="text-gray-800 text-sm font-bold flex-1 mr-2">
              Your{" "}
              <StyledTouchableOpacity onPress={handleShowModal}>
                <StyledText className="underline text-red-600">
                  next appointment
                </StyledText>
              </StyledTouchableOpacity>{" "}
              is on: {nextAppointment.date} at {nextAppointment.time}
            </StyledText>
            <StyledTouchableOpacity onPress={handleClose} className="p-1">
              <StyledText className="text-gray-800 text-sm">✖</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        )}

        {/* Modal for showing appointment details */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseModal}
        >
          <StyledView className="flex-1 justify-center items-center bg-white bg-opacity-50">
            <StyledView className="bg-white p-6 rounded-lg shadow-lg w-4/5">
              <StyledText className="text-lg font-bold mb-4">
                Appointment Details
              </StyledText>
              <StyledText className="mb-2">
                Service: {nextAppointment?.service}
              </StyledText>
              <StyledText className="mb-2">
                Location: {nextAppointment?.location}
              </StyledText>
              <StyledText className="mb-2">
                Date: {nextAppointment?.date}
              </StyledText>
              <StyledText className="mb-2">
                Time: {nextAppointment?.time}
              </StyledText>
              <StyledText className="mb-4">
                Remarks: {nextAppointment?.remarks}
              </StyledText>
              <StyledTouchableOpacity
                onPress={handleCloseModal}
                className="bg-blue-500 py-2 rounded"
              >
                <StyledText className="text-white text-center">
                  Close
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </Modal>

        {/* Health summary and medication information */}
        <StyledView className="flex-row justify-between border-y-2 bg-customBlue mt-16">
          {/* Added mt-16 to adjust for the notification bar */}
          <Text className="ml-4 my-4 text-3xl font-bold">Health Summary</Text>
          <Text className="self-center mr-4">{currentDateTime}</Text>
        </StyledView>
        <StyledView className="ml-8 my-4 space-y-4">
          <Text className="text-sm">Age: {userProfile?.age}</Text>
          <Text className="text-sm">
            Allergies & Reactions: {userProfile?.allergies}
          </Text>
          <Text className="text-sm">Blood Type: {userProfile?.bloodType}</Text>
          <Text className="text-sm">Height: {userProfile?.height} cm</Text>
          <Text className="text-sm">Weight: {userProfile?.weight} kg</Text>
        </StyledView>
        <StyledView className="border-t-2">
          <Text className="ml-8 mt-8 text-2xl font-bold">
            Today's Medication
          </Text>
        </StyledView>
        <StyledView className="ml-16 my-8 space-y-4">
          {medications.map((medication, index) => (
            <StyledView className="flex-row items-center" key={index}>
              {medication.status === "cross" ? (
                <Text className="text-red-600 text-xl mr-2">⚠️</Text>
              ) : (
                <Checkbox
                  className="mr-2"
                  value={medication.status === "tick"}
                  onValueChange={() => {}} // Disabled onValueChange to make it uneditable
                  disabled={true} // Disables the checkbox to make it uneditable
                />
              )}
              <StyledView className="grow">
                <Text className="text-sm font-bold">{medication.name}</Text>
                <Text className="text-sm">
                  {`${medication.dosageStrength}${medication.unit} - ${medication.dosageForm}`}
                </Text>
              </StyledView>
              <StyledView className="mr-16">
                <Text className="text-sm">{medication.time}</Text>
              </StyledView>
            </StyledView>
          ))}
        </StyledView>

        {/* Recently taken pills section */}
        <StyledView className="border-y-2 bg-customBlue">
          <Text className="ml-4 my-4 text-3xl font-bold">
            Recently Taken Pills
          </Text>
        </StyledView>
        <StyledView className="flex-row ml-12 mt-10">
          <StyledView className="grow space-y-4">
            {recentlyTakenPills.map((pill, index) => (
              <StyledView key={index} className="flex-row justify-between">
                <Text className="text-sm">
                  {pill.name}, {pill.dosageStrength}
                  {pill.unit} - {pill.dosageForm}
                </Text>
                <Text className="text-sm mr-12 text-right">
                  {pill.date} {pill.time}
                </Text>
              </StyledView>
            ))}
          </StyledView>
        </StyledView>
      </ScrollView>
    </StyledView>
  );
};

// App component that wraps UserListScreen with the SQLiteProvider
const App: React.FC = () => {
  return (
    <SQLiteProvider databaseName="data.db">
      <UserListScreen />
    </SQLiteProvider>
  );
};

export default App;
