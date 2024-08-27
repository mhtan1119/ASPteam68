import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import {
  useFocusEffect,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { styled } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import Checkbox from "expo-checkbox";
import moment from "moment";

type RootStackParamList = {
  booking: undefined; // Add more routes as needed
  medtracking: undefined;
};

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const UserListScreen: React.FC = () => {
  const db = useSQLiteContext();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [nextAppointment, setNextAppointment] = useState<{
    service: string | number | (string | number)[] | null | undefined;
    location: string | number | (string | number)[] | null | undefined;
    remarks: string | number | (string | number)[] | null | undefined;
    date: string;
    time: string;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // For showing the pop-up
  const [medications, setMedications] = useState<
    {
      name: string;
      dosageStrength: number;
      unit: string;
      dosageForm: string;
      time: string;
    }[]
  >([]); // Store today's medications

  const [userProfile, setUserProfile] = useState<{
    age: number;
    allergies: string;
    bloodType: string;
    height: string;
    weight: string;
  } | null>(null);

  const [currentDateTime, setCurrentDateTime] = useState<string>("");

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
        setNextAppointment(appointmentList[0]);
      }
    } catch (error) {
      console.log("Error fetching appointments:", error);
    }
  };

  const fetchTodaysMedications = async () => {
    try {
      const today = moment().format("dddd"); // Get the day in text format (e.g., "Monday")
      const result: {
        name: string;
        dosageStrength: number;
        unit: string;
        dosageForm: string;
        time: string;
      }[] = await db.getAllAsync(
        "SELECT name, dosageStrength, unit, dosageForm, time FROM medications WHERE date = ?;",
        [today]
      );
      setMedications(result);
    } catch (error) {
      console.log("Error fetching today's medications:", error);
    }
  };

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

  const fetchUserProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem("userProfile");
      if (profileData) {
        const data = JSON.parse(profileData);
        const age = calculateAge(new Date(data.dateOfBirth));
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

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
      fetchTodaysMedications(); // Fetch today's medications whenever the screen is focused
      fetchUserProfile();
    }, [])
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString());
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleShowModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

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

        {/* Rest of the content */}
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
              <Checkbox
                className="mr-2"
                value={false}
                onValueChange={() => {}}
              />
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

        <StyledView className="border-y-2 bg-customBlue">
          <Text className="ml-4 my-4 text-3xl font-bold">
            Recently Taken Pills
          </Text>
        </StyledView>
        <StyledView className="flex-row ml-8 mt-10">
          <StyledView className="grow space-y-4">
            <Text className="text-sm">Paracetamol, 500mg</Text>
            <Text className="text-sm">Lisinopril, 10mg</Text>
            <Text className="text-sm">Metformin, 500mg</Text>
          </StyledView>
          <StyledView className="mr-8 space-y-4">
            <Text className="text-sm">07/12/24 08:12 AM</Text>
            <Text className="text-sm">06/12/24 10:24 PM</Text>
            <Text className="text-sm">06/12/24 07:36 PM</Text>
          </StyledView>
        </StyledView>
      </ScrollView>
    </StyledView>
  );
};

const App: React.FC = () => {
  return (
    <SQLiteProvider databaseName="data.db">
      <UserListScreen />
    </SQLiteProvider>
  );
};

export default App;
