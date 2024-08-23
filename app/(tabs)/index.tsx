import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  useFocusEffect,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { styled } from "nativewind";

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
    date: string;
    time: string;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const fetchAppointments = async () => {
    try {
      const result = await db.getAllAsync(
        "SELECT date, time FROM appointments ORDER BY date ASC, time ASC LIMIT 1;"
      );
      const appointmentList = (result as { date: string; time: string }[]).map(
        (row) => ({
          date: row.date,
          time: row.time,
        })
      );

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

  const handleNavigate = () => {
    navigation.navigate("booking"); // Make sure the route name matches your navigator's route configuration
  };

  return (
    <StyledView className="flex-1 items-center justify-center bg-white p-4">
      {isVisible && nextAppointment && (
        <StyledView className="absolute top-5 left-0 right-0 bg-customBeige p-4 rounded-b-lg items-center flex-row justify-between shadow-lg z-10">
          {/* Warning Icon */}
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
