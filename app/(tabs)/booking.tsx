import React, { useState, useEffect } from "react";
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
import { Picker } from "@react-native-picker/picker";
import RadioForm from "react-native-simple-radio-button";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styled } from "nativewind";
import {
  SQLiteBindParams,
  SQLiteProvider,
  useSQLiteContext,
} from "expo-sqlite";
import {
  HospitalLocation,
  allLocations,
  polyclinics,
  privateHospitals,
  publicHospitals,
  services,
} from "@/constants/hospitalData";
import { useRouter, useLocalSearchParams } from "expo-router";

const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledView = styled(View);

// Initialize the database
const initializeDatabase = async (db: any) => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service TEXT,
        location TEXT,
        date TEXT,
        time TEXT,
        remarks TEXT
      );
    `);
    console.log("Database initialized!");
  } catch (error) {
    console.log("Error while initializing the database:", error);
  }
};

export default function App() {
  return (
    <SQLiteProvider databaseName="appointment7.db" onInit={initializeDatabase}>
      <Booking />
    </SQLiteProvider>
  );
}

function Booking() {
  const db = useSQLiteContext();
  const router = useRouter();
  const {
    service: passedService,
    locationName,
    date: passedDate,
    time: passedTime,
    remarks: passedRemarks,
  } = useLocalSearchParams(); // Retrieve passed service, location, date, time, and remarks

  // Extract healthcare facility names dynamically from the imported data
  const healthcareFacilityNames = allLocations.map((location) => location.name);

  const timeOptions = [];
  for (let h = 8; h <= 17; h++) {
    for (let m = 0; m < 60; m += 15) {
      let hour = h < 10 ? `0${h}` : h;
      let minute = m === 0 ? "00" : m;
      timeOptions.push(`${hour}:${minute}`);
    }
  }
  timeOptions.push("18:00");

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

  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);

  const [tempService, setTempService] = useState(service);
  const [tempLocation, setTempLocation] = useState(location);
  const [tempTime, setTempTime] = useState(time);

  useEffect(() => {
    if (passedService) setService(passedService);
    if (locationName) setLocation(locationName);
    if (passedDate) {
      const dateValue = Array.isArray(passedDate) ? passedDate[0] : passedDate;
      setDate(new Date(dateValue));
    }
    if (passedTime) setTime(passedTime);
    if (passedRemarks) setRemarks(passedRemarks);
  }, [passedService, locationName, passedDate, passedTime, passedRemarks]);

  const radio_props = [
    { label: "Yes", value: 1 },
    { label: "No", value: 0 },
  ];

  const handleServiceSelect = () => {
    setService(tempService);
    setServiceModalVisible(false);
  };

  const handleLocationSelect = () => {
    setLocation(tempLocation);
    setLocationModalVisible(false);
  };

  const handleTimeSelect = () => {
    setTime(tempTime);
    setTimeModalVisible(false);
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const handleSaveAppointment = async () => {
    if (!service || !location || !date || !time) {
      Alert.alert("Error", "Please fill in all the fields.");
      return;
    }

    const formattedDate = date.toISOString().split("T")[0];

    try {
      await db.runAsync(
        "INSERT INTO appointments (service, location, date, time, remarks) VALUES (?, ?, ?, ?, ?);",
        [service, location, formattedDate, time, remarks] as SQLiteBindParams
      );
      Alert.alert("Success", "Appointment saved successfully.");
    } catch (error) {
      console.log("Error saving appointment:", error);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-100">
      <StyledScrollView className="p-5">
        <StyledText className="text-2xl font-bold mb-5 text-center bg-customBlue2 text-white py-3 rounded">
          APPOINTMENTS
        </StyledText>

        <StyledTextInput
          placeholder="Patient’s Name"
          className="h-10 border border-gray-300 rounded px-2 mb-4 bg-white"
        />

        <StyledText className="font-bold mb-2">Services</StyledText>
        <StyledTouchableOpacity
          className="h-10 border border-gray-300 rounded justify-center px-2 mb-4 bg-white"
          onPress={() => setServiceModalVisible(true)}
        >
          <StyledText className="text-gray-800">
            {service ? service : "Select your service"}
          </StyledText>
        </StyledTouchableOpacity>

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

        <StyledText className="font-bold mb-2">Location</StyledText>
        <StyledTouchableOpacity
          className="h-10 border border-gray-300 rounded justify-center px-2 mb-4 bg-white"
          onPress={() => setLocationModalVisible(true)}
        >
          <StyledText className="text-gray-800">
            {location ? location : "Select hospital or polyclinic"}
          </StyledText>
        </StyledTouchableOpacity>

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
            onChange={handleDateChange}
          />
        )}

        <StyledText className="font-bold mb-2">Time</StyledText>
        <StyledTouchableOpacity
          className="h-10 border border-gray-300 rounded justify-center px-2 mb-4 bg-white"
          onPress={() => setTimeModalVisible(true)}
        >
          <StyledText className="text-gray-800">
            {time ? time : "Select time"}
          </StyledText>
        </StyledTouchableOpacity>

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

        <StyledText className="font-bold mb-2">Remarks</StyledText>
        <StyledTextInput
          placeholder="Remarks"
          className="h-10 border border-gray-300 rounded px-2 mb-4 bg-white"
          value={remarks.toString()}
          onChangeText={(text) => setRemarks(text)}
        />

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
          buttonColor={"#2196f3"}
          animation={true}
        />

        <StyledText className="font-bold mb-2 mt-4">
          Any drug allergy?
        </StyledText>
        <RadioForm
          radio_props={radio_props}
          initial={0}
          onPress={(value) => setAllergy(value)}
          formHorizontal={true}
          labelHorizontal={true}
          buttonColor={"#2196f3"}
          animation={true}
        />

        {allergy === 1 && (
          <StyledTextInput
            placeholder="If yes, please state the details"
            className="h-10 border border-gray-300 rounded px-2 mb-4 bg-white"
            value={allergyDetails}
            onChangeText={(text) => setAllergyDetails(text)}
          />
        )}

        <StyledTouchableOpacity
          className="bg-customBlue py-2 rounded mt-5"
          onPress={handleSaveAppointment}
        >
          <StyledText className="text-white text-center text-lg">
            Submit
          </StyledText>
        </StyledTouchableOpacity>

        <StyledView className="h-12" />
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}
