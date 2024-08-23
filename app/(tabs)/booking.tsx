import React, { useState } from "react";
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
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";

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
    <SQLiteProvider databaseName="appointment5.db" onInit={initializeDatabase}>
      <Booking />
    </SQLiteProvider>
  );
}

function Booking() {
  const db = useSQLiteContext();

  const healthcareFacilityNames = [
    "Ang Mo Kio Polyclinic",
    "Bedok Polyclinic",
    "Bukit Batok Polyclinic",
    "Bukit Merah Polyclinic",
    "Choa Chu Kang Polyclinic",
    "Clementi Polyclinic",
    "Geylang Polyclinic",
    "Hougang Polyclinic",
    "Jurong Polyclinic",
    "Marine Parade Polyclinic",
    "Outram Polyclinic",
    "Pasir Ris Polyclinic",
    "Punggol Polyclinic",
    "Queenstown Polyclinic",
    "Sengkang Polyclinic",
    "Tampines Polyclinic",
    "Toa Payoh Polyclinic",
    "Woodlands Polyclinic",
    "Yishun Polyclinic",
    "Mount Elizabeth Hospital",
    "Gleneagles Hospital",
    "Raffles Hospital",
    "Mount Alvernia Hospital",
    "Parkway East Hospital",
    "Farrer Park Hospital",
    "Thomson Medical Centre",
    "Mount Elizabeth Novena Hospital",
    "East Shore Hospital",
    "Bright Vision Hospital",
    "Singapore General Hospital",
    "Tan Tock Seng Hospital",
    "National University Hospital",
    "Changi General Hospital",
    "Khoo Teck Puat Hospital",
    "Ng Teng Fong General Hospital",
    "Sengkang General Hospital",
    "KK Women's and Children's Hospital",
  ];

  const timeOptions = [];
  for (let h = 8; h <= 17; h++) {
    for (let m = 0; m < 60; m += 15) {
      let hour = h < 10 ? `0${h}` : h;
      let minute = m === 0 ? "00" : m;
      timeOptions.push(`${hour}:${minute}`);
    }
  }
  timeOptions.push("18:00");

  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [symptoms, setSymptoms] = useState(0);
  const [allergy, setAllergy] = useState(0);
  const [allergyDetails, setAllergyDetails] = useState("");

  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);

  const [tempService, setTempService] = useState(service);
  const [tempLocation, setTempLocation] = useState(location);
  const [tempTime, setTempTime] = useState(time);

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
        [service, location, formattedDate, time, remarks]
      );
      Alert.alert("Success", "Appointment saved successfully.");
    } catch (error) {
      console.log("Error saving appointment:", error);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-100">
      <StyledScrollView className="p-5">
        <StyledText className="text-2xl font-bold mb-5 text-center">
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
              <Picker.Item
                label="Doctor Consultation"
                value="Doctor Consultation"
              />
              <Picker.Item
                label="Health Plan Discussion"
                value="Health Plan Discussion"
              />
              <Picker.Item label="Vaccination" value="Vaccination" />
              <Picker.Item
                label="Child Immunization"
                value="Child Immunization"
              />
              <Picker.Item
                label="Diabetic Eye Screening"
                value="Diabetic Eye Screening"
              />
              <Picker.Item
                label="Diabetic Foot Screening"
                value="Diabetic Foot Screening"
              />
              <Picker.Item label="Dental Services" value="Dental Services" />
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
          value={remarks}
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
          className="bg-blue-500 py-2 rounded mt-5"
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
