import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TextInput,
  Platform,
  ScrollView,
  Alert,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

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
                        className="mb-4 p-4 border rounded-lg bg-customBlue flex-row items-center"
                      >
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
                        <StyledView>
                          <StyledText className="text-lg font-bold text-black">
                            {medication.name}
                          </StyledText>
                          <StyledText className="text-black">
                            {medication.dosageStrength} {medication.unit} -{" "}
                            {medication.dosageForm}
                          </StyledText>
                        </StyledView>
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
}: {
  onClose: () => void;
  onSave: (
    name: string,
    dosageStrength: string,
    unit: string,
    dosageForm: string,
    time: string
  ) => Promise<void>;
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
    setShowTimePicker(false); // Close the picker when user confirms
  };

  const handleSaveMedication = () => {
    if (!medicationName || !dosageStrength || !unit || !dosageForm || !time) {
      Alert.alert("Validation Error", "Please fill in all the fields.");
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

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}

      {Platform.OS === "ios" && showTimePicker && (
        <StyledTouchableOpacity
          className="h-10 bg-customBlue rounded justify-center items-center mb-4"
          onPress={confirmTime}
        >
          <StyledText className="text-white text-lg">Confirm</StyledText>
        </StyledTouchableOpacity>
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
        onPress={onClose} // Return to the MedTracking page
      >
        <StyledText className="text-white text-lg font-bold text-center">
          Cancel
        </StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
};
