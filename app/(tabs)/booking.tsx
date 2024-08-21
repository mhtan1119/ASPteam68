import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import RadioForm from "react-native-simple-radio-button";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Booking() {
  // Healthcare facility names (polyclinics and hospitals)
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

  // Time options array (from 08:00 to 18:00 with 15-minute intervals)
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

  const [tempService, setTempService] = useState(service); // Temp state for service
  const [tempLocation, setTempLocation] = useState(location); // Temp state for location
  const [tempTime, setTempTime] = useState(time); // Temp state for time

  const radio_props = [
    { label: "Yes", value: 1 },
    { label: "No", value: 0 },
  ];

  const handleServiceSelect = () => {
    setService(tempService); // Set the selected service
    setServiceModalVisible(false);
  };

  const handleLocationSelect = () => {
    setLocation(tempLocation); // Set the selected location
    setLocationModalVisible(false);
  };

  const handleTimeSelect = () => {
    setTime(tempTime); // Set the selected time
    setTimeModalVisible(false);
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>APPOINTMENTS</Text>

        {/* Patient's Name Input */}
        <TextInput placeholder="Patient’s Name" style={styles.input} />

        {/* Service Picker */}
        <Text style={styles.label}>Service</Text>
        <TouchableOpacity
          style={styles.pickerTouchable}
          onPress={() => setServiceModalVisible(true)}
        >
          <Text style={styles.pickerText}>
            {service ? service : "Select your service"}
          </Text>
        </TouchableOpacity>

        {/* Service Picker Modal */}
        <Modal visible={serviceModalVisible} animationType="slide">
          <View style={styles.modalContainer}>
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
            <Button title="Select" onPress={handleServiceSelect} />
            <Button
              title="Cancel"
              color="red"
              onPress={() => setServiceModalVisible(false)}
            />
          </View>
        </Modal>

        {/* Location Picker */}
        <Text style={styles.label}>Location</Text>
        <TouchableOpacity
          style={styles.pickerTouchable}
          onPress={() => setLocationModalVisible(true)}
        >
          <Text style={styles.pickerText}>
            {location ? location : "Select hospital or polyclinic"}
          </Text>
        </TouchableOpacity>

        {/* Location Picker Modal */}
        <Modal visible={locationModalVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <Picker
              selectedValue={tempLocation}
              onValueChange={(itemValue) => setTempLocation(itemValue)}
            >
              {healthcareFacilityNames.map((facility, index) => (
                <Picker.Item label={facility} value={facility} key={index} />
              ))}
            </Picker>
            <Button title="Select" onPress={handleLocationSelect} />
            <Button
              title="Cancel"
              color="red"
              onPress={() => setLocationModalVisible(false)}
            />
          </View>
        </Modal>

        {/* Date Picker */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.pickerTouchable}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.pickerText}>
            {date.toLocaleDateString() || "Select date"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Time Picker */}
        <Text style={styles.label}>Time</Text>
        <TouchableOpacity
          style={styles.pickerTouchable}
          onPress={() => setTimeModalVisible(true)}
        >
          <Text style={styles.pickerText}>{time ? time : "Select time"}</Text>
        </TouchableOpacity>

        {/* Time Picker Modal */}
        <Modal visible={timeModalVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <Picker
              selectedValue={tempTime}
              onValueChange={(itemValue) => setTempTime(itemValue)}
            >
              {timeOptions.map((timeOption, index) => (
                <Picker.Item label={timeOption} value={timeOption} key={index} />
              ))}
            </Picker>
            <Button title="Select" onPress={handleTimeSelect} />
            <Button
              title="Cancel"
              color="red"
              onPress={() => setTimeModalVisible(false)}
            />
          </View>
        </Modal>

        {/* Remarks Input */}
        <Text style={styles.label}>Remarks</Text>
        <TextInput placeholder="Remarks" style={styles.input} />

        {/* Symptoms Radio Buttons */}
        <Text style={styles.label}>Do you have any of the following symptoms:</Text>
        <Text style={styles.symptomsText}>
          Fever, Cough, Sore Throat, Runny Nose
        </Text>
        <RadioForm
          radio_props={radio_props}
          initial={0}
          onPress={(value) => setSymptoms(value)}
          formHorizontal={true}
          labelHorizontal={true}
          buttonColor={"#2196f3"}
          animation={true}
          style={styles.radioForm}
        />

        {/* Allergy Radio Buttons */}
        <Text style={styles.label}>Any drug allergy?</Text>
        <RadioForm
          radio_props={radio_props}
          initial={0}
          onPress={(value) => setAllergy(value)}
          formHorizontal={true}
          labelHorizontal={true}
          buttonColor={"#2196f3"}
          animation={true}
          style={styles.radioForm}
        />

        {/* Allergy Details Input */}
        {allergy === 1 && (
          <TextInput
            placeholder="If yes, please state the details"
            style={styles.input}
            value={allergyDetails}
            onChangeText={(text) => setAllergyDetails(text)}
          />
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>

        {/* Spacer to ensure full display of Submit button */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#cccccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 15,
    backgroundColor: "#ffffff",
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  pickerTouchable: {
    height: 40,
    borderColor: "#cccccc",
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: "center",
    paddingLeft: 10,
    marginBottom: 15,
    backgroundColor: "#ffffff",
  },
  pickerText: {
    color: "#333333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  radioForm: {
    marginBottom: 15,
  },
  symptomsText: {
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#2196f3",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});
