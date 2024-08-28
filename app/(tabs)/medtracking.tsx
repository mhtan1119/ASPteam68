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
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { styled } from "nativewind";
import {
  SQLiteBindParams,
  SQLiteProvider,
  useSQLiteContext,
} from "expo-sqlite";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

// Initialize the database
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

export default function App() {
  return (
    <SQLiteProvider databaseName="data.db" onInit={initializeDatabase}>
      <MedTracking />
    </SQLiteProvider>
  );
}

const MedTracking = () => {
  const db = useSQLiteContext();
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
    daysOfWeek[(currentDayIndex + 5) % 7],
    daysOfWeek[(currentDayIndex + 6) % 7],
    daysOfWeek[currentDayIndex], // Current day (middle day)
    daysOfWeek[(currentDayIndex + 1) % 7],
    daysOfWeek[(currentDayIndex + 2) % 7],
    daysOfWeek[(currentDayIndex + 3) % 7],
    daysOfWeek[(currentDayIndex + 4) % 7],
  ];

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

  const [medications, setMedications] = useState<Medication[]>([]);

  // Fetch medications whenever selectedDayIndex changes
  useEffect(() => {
    fetchMedications();
  }, [selectedDayIndex]);

  const fetchMedications = () => {
    try {
      const result: Medication[] = db.getAllSync(
        "SELECT * FROM medications WHERE date = ? ORDER BY time ASC;",
        [orderedDays[selectedDayIndex]]
      );
      setMedications(result); // Assuming the result is an array of rows

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

  const handleDayPress = (index: number) => {
    // Prevent selecting past days
    if (index < 2) {
      Alert.alert(
        "Selection Error",
        "You cannot add medication for previous days."
      );
      return;
    }
    setSelectedDayIndex(index);
  };

  const groupMedicationsByTime = (medications: Medication[]) => {
    return medications.reduce((acc, medication) => {
      if (!acc[medication.time]) {
        acc[medication.time] = [];
      }
      acc[medication.time].push(medication);
      return acc;
    }, {} as Record<string, Medication[]>);
  };

  const filteredMedications = groupMedicationsByTime(
    medications.filter(
      (medication) => medication.date === orderedDays[selectedDayIndex]
    )
  );

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
      fetchMedications(); // Fetch updated medications list
    } catch (error) {
      console.log("Error saving medication:", error);
    }
  };

  const deleteMedication = async (id: number) => {
    try {
      await db.runAsync("DELETE FROM medications WHERE id = ?;", [id]);
      Alert.alert("Success", "Medication deleted successfully.");
      fetchMedications(); // Refresh the medication list after deletion
    } catch (error) {
      console.log("Error deleting medication:", error);
    }
  };

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

          {/* Day Circles */}
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

          {/* Add Medication Button */}
          {!showAddMedication && (
            <StyledTouchableOpacity
              className="bg-customBlue py-3 px-6 rounded-lg mt-4 shadow-md"
              onPress={() => setShowAddMedication(true)}
            >
              <StyledText className="text-black text-lg font-bold text-center">
                <StyledText className="text-xl font-bold mr-2">+</StyledText>{" "}
                Add Medication
              </StyledText>
            </StyledTouchableOpacity>
          )}

          {/* Add Medication Form */}
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

          {/* Medication Items */}
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

          {/* Save Button */}
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
    setShowTimePicker(false); // Close the picker when the user confirms
  };

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
                textColor="black" // Ensures the text is black and visible
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
        className="bg-gray-400 py-3 rounded-lg mt-2 shadow-md"
        onPress={onClose}
      >
        <StyledText className="text-white text-lg font-bold text-center">
          Cancel
        </StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
};
