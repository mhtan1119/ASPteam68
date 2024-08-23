import React, { useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from "react-native";
import moment from "moment";

const Index = () => {
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
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>
            <Text style={styles.plusSign}>+</Text> Add Medication
          </Text>
        </TouchableOpacity>

        {/* Time Label */}
        <Text style={styles.timeLabel}>8:30</Text>

        {/* Medication Items */}
        <View style={styles.medicationItemsContainer}>
          <TouchableOpacity style={styles.medicationItem}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() =>
                toggleStatus(firstMedicationStatus, setFirstMedicationStatus)
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
                toggleStatus(secondMedicationStatus, setSecondMedicationStatus)
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
      </View>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center", // Center content horizontally
  },
  dateDisplay: {
    fontSize: 20,
    color: "#000000",
    marginBottom: 16,
    textAlign: "center", // Center text horizontally
  },
  dayCircles: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16, // Keep the spacing below the circles as before
    width: "100%",
    maxWidth: 300, // Limit width to keep circles centered
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
    marginTop: 16, // Keep the spacing close to the day circles
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // For Android shadow
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
    marginRight: 8, // Add space between + sign and text
  },
  timeLabel: {
    marginTop: 16, // Add more top padding to the time label
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "left", // Align the time label to the left
    alignSelf: "flex-start", // Make sure the time label stays on the left
  },
  medicationItemsContainer: {
    marginTop: 8, // Reduced spacing between the time label and the medication items
    width: "100%", // Make sure the container takes the full width
  },
  medicationItem: {
    backgroundColor: "#E5F0FF",
    paddingVertical: 12, // Reduced padding
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
    elevation: 5, // For Android shadow
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
});
