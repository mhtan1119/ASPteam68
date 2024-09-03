// Import necessary modules and components from React and React Native
import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TextInput,
  Platform,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import Picker for dropdowns
import DateTimePicker from "@react-native-community/datetimepicker"; // Import DateTimePicker for time selection
import moment from "moment"; // Import moment for date manipulation
import { styled } from "nativewind"; // Import styled components for Tailwind-like styling
import {
  SQLiteBindParams,
  SQLiteProvider,
  useSQLiteContext,
} from "expo-sqlite"; // Import SQLite components for local database management

// Define styled components for consistent styling
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

// Function to initialize the local SQLite database
const initializeDatabase = async (db: any) => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        dosageStrength TEXT,
        unit TEXT,
        dosageForm TEXT,
        time TEXT,
        date TEXT,
        status TEXT DEFAULT ''
      );
    `);
    console.log("Database initialized!");
  } catch (error) {
    console.log("Error while initializing the database:", error);
  }
};

// Main App component providing SQLite context
export default function App() {
  return (
    <SQLiteProvider databaseName="data.db" onInit={initializeDatabase}>
      <MedTracking />
    </SQLiteProvider>
  );
}

// Component for medication tracking
const MedTracking = () => {
  const db = useSQLiteContext(); // Access SQLite database context
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

  // Order days to display them around the current day
  const orderedDays = [
    daysOfWeek[(currentDayIndex + 5) % 7],
    daysOfWeek[(currentDayIndex + 6) % 7],
    daysOfWeek[currentDayIndex],
    daysOfWeek[(currentDayIndex + 1) % 7],
    daysOfWeek[(currentDayIndex + 2) % 7],
    daysOfWeek[(currentDayIndex + 3) % 7],
    daysOfWeek[(currentDayIndex + 4) % 7],
  ];

  // State variables for managing selected day, form visibility, and medication data
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(2); // Start with the middle day selected
  const [showAddMedication, setShowAddMedication] = useState(false); // To toggle add medication form visibility
  const [medicationStatuses, setMedicationStatuses] = useState<
    Record<number, string>
  >({}); // Store medication statuses

  interface Medication {
    id: number;
    name: string;
    dosageStrength: string;
    unit: string;
    dosageForm: string;
    time: string;
    date: string;
    status: string; // New status field
  }

  const [medications, setMedications] = useState<Medication[]>([]); // State for storing medication list

  // Fetch medications whenever the selected day changes
  useEffect(() => {
    fetchMedications();
  }, [selectedDayIndex]);

  // Function to fetch medications from the local SQLite database
  const fetchMedications = () => {
    try {
      const result: Medication[] = db.getAllSync(
        "SELECT * FROM medications WHERE date = ? ORDER BY time ASC;",
        [orderedDays[selectedDayIndex]]
      );
      setMedications(result); // Set fetched medications to state

      // Initialize statuses
      const initialStatuses: Record<number, string> = {};
      result.forEach((medication) => {
        initialStatuses[medication.id] = medication.status;
      });
      setMedicationStatuses(initialStatuses);
    } catch (error) {
      console.log("Error fetching medications:", error);
    }
  };

  // Function to handle day selection
  const handleDayPress = (index: number) => {
    if (index < 2) {
      // Prevent selecting past days
      Alert.alert(
        "Selection Error",
        "You cannot add medication for previous days."
      );
      return;
    }
    setSelectedDayIndex(index);
  };

  // Function to group medications by time for easier display
  const groupMedicationsByTime = (medications: Medication[]) => {
    return medications.reduce((acc, medication) => {
      if (!acc[medication.time]) {
        acc[medication.time] = [];
      }
      acc[medication.time].push(medication);
      return acc;
    }, {} as Record<string, Medication[]>);
  };

  // Filter medications for the selected day
  const filteredMedications = groupMedicationsByTime(
    medications.filter(
      (medication) => medication.date === orderedDays[selectedDayIndex]
    )
  );

  // Function to save a new medication to the database
  const saveMedication = async (
    name: string,
    dosageStrength: string,
    unit: string,
    dosageForm: string,
    time: string,
    date: string
  ) => {
    try {
      await db.runAsync(
        "INSERT INTO medications (name, dosageStrength, unit, dosageForm, time, date) VALUES (?, ?, ?, ?, ?, ?);",
        [name, dosageStrength, unit, dosageForm, time, date] as SQLiteBindParams
      );
      Alert.alert("Success", "Medication saved successfully.");
      fetchMedications(); // Refresh medication list after saving
    } catch (error) {
      console.log("Error saving medication:", error);
    }
  };

  // Function to delete a medication from the database
  const deleteMedication = async (id: number) => {
    try {
      await db.runAsync("DELETE FROM medications WHERE id = ?;", [id]);
      Alert.alert("Success", "Medication deleted successfully.");
      fetchMedications(); // Refresh medication list after deletion
    } catch (error) {
      console.log("Error deleting medication:", error);
    }
  };

  // Function to confirm medication deletion
  const confirmDeleteMedication = (id: number) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this medication?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMedication(id),
        },
      ],
      { cancelable: true }
    );
  };

  // Function to toggle the status of a medication
  const toggleMedicationStatus = (id: number) => {
    setMedicationStatuses((prevStatuses) => {
      const newStatus =
        prevStatuses[id] === "tick"
          ? "cross"
          : prevStatuses[id] === "cross"
          ? ""
          : "tick";
      return { ...prevStatuses, [id]: newStatus };
    });
  };

  // Function to save medication statuses to the database
  const saveStatuses = async () => {
    try {
      for (const [id, status] of Object.entries(medicationStatuses)) {
        await db.runAsync("UPDATE medications SET status = ? WHERE id = ?;", [
          status,
          id,
        ]);
      }
      Alert.alert("Success", "Medication statuses saved successfully.");
    } catch (error) {
      console.log("Error saving statuses:", error);
    }
  };

  // Component rendering starts here
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <StyledView className="items-center">
          {/* Date Display */}
          <StyledText className="text-2xl text-black mb-4 text-center">
            {orderedDays[selectedDayIndex]},{" "}
            {moment()
              .add(selectedDayIndex - 2, "days")
              .format("D MMM")}
          </StyledText>

          {/* Day Selection Circles */}
          <StyledView className="flex-row justify-between mb-4 w-full max-w-[300px]">
            {orderedDays.map((day, index) => (
              <StyledTouchableOpacity
                key={index}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  index === selectedDayIndex ? "bg-customBlue" : "bg-black"
                }`}
                onPress={() => handleDayPress(index)}
                style={{ marginHorizontal: 3 }} // Add horizontal margin to increase spacing
              >
                <StyledText className="text-white">
                  {day.slice(0, 3)}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>

          {/* Button to Add Medication */}
          {!showAddMedication && (
            <StyledTouchableOpacity
              className="bg-customBlue py-3 px-6 rounded-lg mt-4 shadow-md"
              onPress={() => setShowAddMedication(true)}
            >
              <StyledText className="text-white text-lg font-bold text-center">
                <StyledText className="text-xl font-bold mr-2">+</StyledText>{" "}
                Add Medication
              </StyledText>
            </StyledTouchableOpacity>
          )}

          {/* Form to Add Medication */}
          {showAddMedication && (
            <AddMedication
              onClose={() => setShowAddMedication(false)}
              onSave={(name, dosageStrength, unit, dosageForm, time) =>
                saveMedication(
                  name,
                  dosageStrength,
                  unit,
                  dosageForm,
                  time,
                  orderedDays[selectedDayIndex]
                )
              }
              orderedDays={orderedDays}
              selectedDayIndex={selectedDayIndex}
            />
          )}

          {/* Display of Medication Items */}
          {!showAddMedication && (
            <StyledView className="mt-8 w-full">
              {Object.keys(filteredMedications).length > 0 ? (
                Object.entries(filteredMedications).map(([time, meds]) => (
                  <React.Fragment key={time}>
                    <StyledText className="text-lg font-bold mb-2">
                      {time} {/* Time displayed outside the box */}
                    </StyledText>
                    {meds.map((medication) => (
                      <StyledView
                        key={medication.id}
                        className="mb-4 p-4 border rounded-lg bg-customBlue flex-row items-center justify-between"
                      >
                        {/* Medication Status Toggle */}
                        <StyledTouchableOpacity
                          className="w-8 h-8 border border-black rounded-sm mr-4 items-center justify-center bg-white"
                          onPress={() => toggleMedicationStatus(medication.id)}
                        >
                          <StyledText className="text-xl">
                            {medicationStatuses[medication.id] === "tick"
                              ? "✔️"
                              : medicationStatuses[medication.id] === "cross"
                              ? "❌"
                              : ""}
                          </StyledText>
                        </StyledTouchableOpacity>

                        {/* Medication Details */}
                        <StyledView className="flex-1">
                          <StyledText className="text-lg font-bold text-black">
                            {medication.name}
                          </StyledText>
                          <StyledText className="text-black">
                            {medication.dosageStrength} {medication.unit} -{" "}
                            {medication.dosageForm}
                          </StyledText>
                        </StyledView>

                        {/* Delete Button with Confirmation */}
                        <StyledTouchableOpacity
                          onPress={() => confirmDeleteMedication(medication.id)}
                          className="ml-4"
                        >
                          <StyledText className="text-red-500 text-lg font-bold">
                            ✖️
                          </StyledText>
                        </StyledTouchableOpacity>
                      </StyledView>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <StyledText className="text-center text-gray-500">
                  No medications found for the selected day.
                </StyledText>
              )}
            </StyledView>
          )}

          {/* Button to Save Statuses */}
          {!showAddMedication && (
            <StyledTouchableOpacity
              className="bg-customBlue py-3 px-6 rounded-lg mt-4 shadow-md"
              onPress={saveStatuses}
            >
              <StyledText className="text-white text-lg font-bold text-center">
                Save Statuses
              </StyledText>
            </StyledTouchableOpacity>
          )}
        </StyledView>
      </ScrollView>
    </SafeAreaView>
  );
};

// Component to add a new medication
const AddMedication = ({
  onClose,
  onSave,
  orderedDays,
  selectedDayIndex,
}: {
  onClose: () => void;
  onSave: (
    name: string,
    dosageStrength: string,
    unit: string,
    dosageForm: string,
    time: string
  ) => Promise<void>;
  orderedDays: string[];
  selectedDayIndex: number;
}) => {
  // State variables for medication form inputs
  const [medicationName, setMedicationName] = useState("");
  const [dosageStrength, setDosageStrength] = useState("");
  const [unit, setUnit] = useState("mg");
  const [dosageForm, setDosageForm] = useState("");
  const [time, setTime] = useState(new Date());
  const [showFormPicker, setShowFormPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Function to handle time change in DateTimePicker
  const onTimeChange = (event: any, selectedTime: Date | undefined) => {
    const currentTime = selectedTime || time;
    setTime(currentTime);
    if (Platform.OS !== "ios") {
      setShowTimePicker(false); // Close the picker after selection for non-iOS
    }
  };

  // Function to format time for display
  const formatTime = (time: Date) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Function to confirm time selection in the picker
  const confirmTime = () => {
    setShowTimePicker(false); // Close the picker when the user confirms
  };

  // Function to handle medication saving
  const handleSaveMedication = () => {
    if (!medicationName || !dosageStrength || !unit || !dosageForm || !time) {
      Alert.alert("Validation Error", "Please fill in all the fields.");
      return;
    }

    const currentDateTime = new Date();
    const selectedDateTime = new Date(
      currentDateTime.getFullYear(),
      currentDateTime.getMonth(),
      currentDateTime.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    // Allow selection of the current time but prevent selecting times earlier than the current time
    if (
      orderedDays[selectedDayIndex] === orderedDays[2] && // Check if today is selected
      selectedDateTime.getTime() <
        new Date(currentDateTime.setSeconds(0, 0)).getTime() // Ignore seconds and milliseconds for a more lenient comparison
    ) {
      Alert.alert("Invalid Time", "You cannot select a time in the past.");
      return;
    }

    onSave(medicationName, dosageStrength, unit, dosageForm, formatTime(time));
    onClose();
  };

  // Render the add medication form
  return (
    <StyledView className="w-full">
      <StyledText className="text-lg font-bold mb-2">
        Name of Medication
      </StyledText>
      <StyledTextInput
        className="h-10 border border-gray-300 rounded px-2 mb-4"
        placeholder="Enter medication name"
        value={medicationName}
        onChangeText={setMedicationName}
      />

      <StyledText className="text-lg font-bold mb-2">
        Dosage Strength
      </StyledText>
      <StyledTextInput
        className="h-10 border border-gray-300 rounded px-2 mb-4"
        placeholder="Enter dosage strength"
        value={dosageStrength}
        onChangeText={setDosageStrength}
        keyboardType="numeric"
      />

      <StyledText className="text-lg font-bold mb-2">Choose Unit</StyledText>
      <StyledTouchableOpacity
        className="h-10 bg-customBlue rounded justify-center items-center mb-4"
        onPress={() => setShowUnitPicker(true)}
      >
        <StyledText className="text-white text-lg">{unit}</StyledText>
      </StyledTouchableOpacity>

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

      <StyledText className="text-lg font-bold mb-2">Dosage Form</StyledText>
      <StyledTouchableOpacity
        className="h-10 bg-customBlue rounded justify-center items-center mb-4"
        onPress={() => setShowFormPicker(true)}
      >
        <StyledText className="text-white text-lg">
          {dosageForm || "Select dosage form"}
        </StyledText>
      </StyledTouchableOpacity>

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

      <StyledText className="text-lg font-bold mb-2">
        Time to be Taken
      </StyledText>
      <StyledTouchableOpacity
        className="h-10 bg-customBlue rounded justify-center items-center mb-4"
        onPress={() => setShowTimePicker(true)}
      >
        <StyledText className="text-white text-lg">
          {formatTime(time)}
        </StyledText>
      </StyledTouchableOpacity>

      {showTimePicker && Platform.OS === "ios" && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showTimePicker}
          onRequestClose={confirmTime}
        >
          <StyledView className="flex-1 justify-center items-center bg-black bg-opacity-75">
            <StyledView className="bg-white p-6 rounded-lg shadow-lg w-4/5">
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
                textColor="black"
              />
              <StyledTouchableOpacity
                className="mt-4 bg-customBlue py-2 rounded-lg"
                onPress={confirmTime}
              >
                <StyledText className="text-white text-center">
                  Confirm
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </Modal>
      )}

      {Platform.OS !== "ios" && showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      {/* Save Medication Button */}
      <StyledTouchableOpacity
        className="bg-customBlue py-3 rounded-lg mt-4 shadow-md"
        onPress={handleSaveMedication}
      >
        <StyledText className="text-white text-lg font-bold text-center">
          Save Medication
        </StyledText>
      </StyledTouchableOpacity>

      {/* Cancel Button */}
      <StyledTouchableOpacity
        className="bg-customBlue2 py-3 rounded-lg mt-2 shadow-md"
        onPress={onClose}
      >
        <StyledText className="text-white text-lg font-bold text-center">
          Cancel
        </StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
};
