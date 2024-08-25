import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  useFocusEffect,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { styled } from "nativewind";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Checkbox from "expo-checkbox";

type RootStackParamList = {
  booking: undefined; // Add more routes as needed
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

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleNavigate = async () => {
    await fetchAppointments(); // Ensure data is fresh before navigating
    if (nextAppointment) {
      router.push({
        pathname: "/booking",
        params: {
          service: nextAppointment.service,
          location: nextAppointment.location,
          date: nextAppointment.date,
          time: nextAppointment.time,
          remarks: nextAppointment.remarks,
        },
      });
    }
  };

  return (
    <StyledView className="flex-1 flex-col py-10 bg-white">
      <StatusBar style="dark"></StatusBar>
      {isVisible && nextAppointment && (
        <StyledView className="absolute top-8 left-0 right-0 bg-customBeige p-4 rounded-b-lg items-center flex-row justify-between shadow-lg z-10">
          {/* Adjusted top-16 to shift notification down */}
          <StyledText className="text-red-600 text-xl mr-2">⚠️</StyledText>
          <StyledText className="text-gray-800 text-sm font-bold flex-1 mr-2">
            Your{" "}
            <StyledTouchableOpacity onPress={handleNavigate}>
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
      {/* Rest of the content */}
      <StyledView className="flex-row border-y-2 bg-customBlue mt-16">
        {/* Added mt-16 to adjust for the notification bar */}
        <Text className="grow ml-4 my-4 text-3xl font-bold">
          Health Summary
        </Text>
        <Text className="self-center mr-4">07/12/24 08:23 AM</Text>
      </StyledView>
      <StyledView className="ml-8 my-4 space-y-4">
        <Text className="text-sm">Age: 30</Text>
        <Text className="text-sm">Allergies & Reactions: N/A</Text>
        <Text className="text-sm">Blood Type: AB+</Text>
        <Text className="text-sm">Height: 170cm</Text>
        <Text className="text-sm">Weight: 65kg</Text>
      </StyledView>
      <StyledView className="border-t-2">
        <Text className="ml-8 mt-8 text-2xl font-bold">Today's Medication</Text>
      </StyledView>
      <StyledView className="flex-row ml-16 my-8">
        <StyledView className="space-y-5">
          <Checkbox className="mr-2" value={false} onValueChange={() => {}} />
          <Checkbox className="" value={false} onValueChange={() => {}} />
          <Checkbox className="" value={false} onValueChange={() => {}} />
        </StyledView>
        <StyledView className="grow space-y-4">
          <Text className="text-sm">Paracetamol, 500mg</Text>
          <Text className="text-sm">Ibuprofen, 400mg</Text>
          <Text className="text-sm">Metformin, 500mg</Text>
        </StyledView>
        <StyledView className="mr-16 space-y-4">
          <Text className="text-sm">08:00 AM</Text>
          <Text className="text-sm">08:00 AM</Text>
          <Text className="text-sm">07:30 PM</Text>
        </StyledView>
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
    </StyledView>
  );
};

const App: React.FC = () => {
  return (
    <SQLiteProvider databaseName="appointment7.db">
      <UserListScreen />
    </SQLiteProvider>
  );
};

export default App;
