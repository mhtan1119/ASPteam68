import React, { useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TextInput,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";

const MedTracking = () => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = new Date();
  const currentDayIndex = today.getDay();

  const orderedDays = [
    daysOfWeek[(currentDayIndex + 6) % 7],
    daysOfWeek[(currentDayIndex + 5) % 7],
    daysOfWeek[currentDayIndex], // Current day (middle day)
    daysOfWeek[(currentDayIndex + 1) % 7],
    daysOfWeek[(currentDayIndex + 2) % 7],
  ];

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(2); // Start with the middle day selected
  const [firstMedicationStatus, setFirstMedicationStatus] =
    useState<string>(""); // '', 'tick', 'cross'
  const [secondMedicationStatus, setSecondMedicationStatus] =
    useState<string>(""); // '', 'tick', 'cross'
  const [showAddMedication, setShowAddMedication] = useState(false); // To toggle add medication form visibility

  const handleDayPress = (index: number) => {
    setSelectedDayIndex(index);
  };

  const toggleStatus = (
    status: string,
    setStatus: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (status === "") {
      setStatus("tick");
    } else if (status === "tick") {
      setStatus("cross");
    } else {
      setStatus("");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Date Display */}
        <Text style={styles.dateDisplay}>
          {orderedDays[selectedDayIndex]},{" "}
          {moment()
            .add(selectedDayIndex - 2, "days")
            .format("D MMM")}
        </Text>

        {/* Day Circles */}
        <View style={styles.dayCircles}>
          {orderedDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCircle,
                index === selectedDayIndex && styles.selectedDayCircle,
              ]}
              onPress={() => handleDayPress(index)}
            >
              <Text style={styles.dayText}>{day.slice(0, 3)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Medication Button */}
        {!showAddMedication && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddMedication(true)}
          >
            <Text style={styles.addButtonText}>
              <Text style={styles.plusSign}>+</Text> Add Medication
            </Text>
          </TouchableOpacity>
        )}

        {/* Add Medication Form */}
        {showAddMedication && (
          <AddMedication onClose={() => setShowAddMedication(false)} />
        )}

        {/* Medication Items */}
        {!showAddMedication && (
          <>
            <Text style={styles.timeLabel}>8:30</Text>
            <View style={styles.medicationItemsContainer}>
              <TouchableOpacity style={styles.medicationItem}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    toggleStatus(
                      firstMedicationStatus,
                      setFirstMedicationStatus
                    )
                  }
                >
                  <Text style={styles.checkboxText}>
                    {firstMedicationStatus === "tick"
                      ? "✔️"
                      : firstMedicationStatus === "cross"
                      ? "❌"
                      : ""}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.medicationText}>Paracetamol, 250 mg</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.medicationItem}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    toggleStatus(
                      secondMedicationStatus,
                      setSecondMedicationStatus
                    )
                  }
                >
                  <Text style={styles.checkboxText}>
                    {secondMedicationStatus === "tick"
                      ? "✔️"
                      : secondMedicationStatus === "cross"
                      ? "❌"
                      : ""}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.medicationText}>Losartan, 400 mg</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const AddMedication = ({ onClose }: { onClose: () => void }) => {
  const [medicationName, setMedicationName] = useState("");
  const [dosageStrength, setDosageStrength] = useState("");
  const [unit, setUnit] = useState("mg");
  const [dosageForm, setDosageForm] = useState("");
  const [time, setTime] = useState(new Date());
  const [showFormPicker, setShowFormPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onTimeChange = (event: any, selectedTime: Date | undefined) => {
    const currentTime = selectedTime || time;
    setTime(currentTime);
    if (Platform.OS !== "ios") {
      setShowTimePicker(false); // Close the picker after selection for non-iOS
    }
  };

  const formatTime = (time: Date) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const confirmTime = () => {
    setShowTimePicker(false); // Close the picker when user confirms
  };

  return (
    <View style={styles.addMedicationContainer}>
      <Text style={styles.label}>Name of Medication</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter medication name"
        value={medicationName}
        onChangeText={setMedicationName}
      />

      <Text style={styles.label}>Dosage Strength</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter dosage strength"
        value={dosageStrength}
        onChangeText={setDosageStrength}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Choose Unit</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowUnitPicker(true)}
      >
        <Text style={styles.buttonText}>{unit}</Text>
      </TouchableOpacity>

      {showUnitPicker && (
        <Picker
          selectedValue={unit}
          onValueChange={(itemValue) => {
            setUnit(itemValue);
            setShowUnitPicker(false);
          }}
        >
          <Picker.Item label="mg" value="mg" />
          <Picker.Item label="mcg" value="mcg" />
          <Picker.Item label="g" value="g" />
          <Picker.Item label="ml" value="ml" />
          <Picker.Item label="%" value="%" />
        </Picker>
      )}

      <Text style={styles.label}>Dosage Form</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowFormPicker(true)}
      >
        <Text style={styles.buttonText}>
          {dosageForm || "Select dosage form"}
        </Text>
      </TouchableOpacity>

      {showFormPicker && (
        <Picker
          selectedValue={dosageForm}
          onValueChange={(itemValue) => {
            setDosageForm(itemValue);
            setShowFormPicker(false);
          }}
        >
          <Picker.Item label="Capsule" value="capsule" />
          <Picker.Item label="Tablet" value="tablet" />
          <Picker.Item label="Liquid" value="liquid" />
          <Picker.Item label="Topical" value="topical" />
        </Picker>
      )}

      <Text style={styles.label}>Time to be Taken</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.buttonText}>{formatTime(time)}</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}

      {Platform.OS === "ios" && showTimePicker && (
        <TouchableOpacity style={styles.confirmButton} onPress={confirmTime}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          // Handle saving the medication
          onClose(); // Close the form
        }}
      >
        <Text style={styles.saveButtonText}>Save Medication</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MedTracking;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  dateDisplay: {
    fontSize: 20,
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  dayCircles: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    width: "100%",
    maxWidth: 300,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDayCircle: {
    backgroundColor: "#83B4FF",
  },
  dayText: {
    color: "#FFFFFF",
  },
  addButton: {
    backgroundColor: "#83B4FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  plusSign: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 8,
  },
  timeLabel: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "left",
    alignSelf: "flex-start",
  },
  medicationItemsContainer: {
    marginTop: 8,
    width: "100%",
  },
  medicationItem: {
    backgroundColor: "#83B4FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 5,
    borderColor: "#000000",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  checkboxText: {
    fontSize: 18,
  },
  medicationText: {
    fontSize: 16,
    color: "#000000",
  },
  addMedicationContainer: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  button: {
    height: 40,
    backgroundColor: "#83B4FF",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  confirmButton: {
    height: 40,
    backgroundColor: "#83B4FF",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#83B4FF",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
