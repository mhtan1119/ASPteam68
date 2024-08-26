import React, { useState } from "react";
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TextInput,
  Platform,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

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
              <StyledText className="text-white text-lg font-bold text-center">
                <StyledText className="text-xl font-bold mr-2">+</StyledText>{" "}
                Add Medication
              </StyledText>
            </StyledTouchableOpacity>
          )}

          {/* Add Medication Form */}
          {showAddMedication && (
            <AddMedication onClose={() => setShowAddMedication(false)} />
          )}

          {/* Medication Items */}
          {!showAddMedication && (
            <>
              <StyledText className="mt-4 text-lg font-bold text-black">
                8:30
              </StyledText>
              <StyledView className="mt-2 w-full">
                <StyledTouchableOpacity className="bg-customBlue py-3 px-4 rounded-lg mt-2 w-full flex-row items-center shadow-md">
                  <StyledTouchableOpacity
                    className="w-7 h-7 rounded-md border border-black items-center justify-center mr-4"
                    onPress={() =>
                      toggleStatus(
                        firstMedicationStatus,
                        setFirstMedicationStatus
                      )
                    }
                  >
                    <StyledText className="text-lg">
                      {firstMedicationStatus === "tick"
                        ? "✔️"
                        : firstMedicationStatus === "cross"
                        ? "❌"
                        : ""}
                    </StyledText>
                  </StyledTouchableOpacity>
                  <StyledText className="text-lg text-black">
                    Paracetamol, 250 mg
                  </StyledText>
                </StyledTouchableOpacity>

                <StyledTouchableOpacity className="bg-customBlue py-3 px-4 rounded-lg mt-2 w-full flex-row items-center shadow-md">
                  <StyledTouchableOpacity
                    className="w-7 h-7 rounded-md border border-black items-center justify-center mr-4"
                    onPress={() =>
                      toggleStatus(
                        secondMedicationStatus,
                        setSecondMedicationStatus
                      )
                    }
                  >
                    <StyledText className="text-lg">
                      {secondMedicationStatus === "tick"
                        ? "✔️"
                        : secondMedicationStatus === "cross"
                        ? "❌"
                        : ""}
                    </StyledText>
                  </StyledTouchableOpacity>
                  <StyledText className="text-lg text-black">
                    Losartan, 400 mg
                  </StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            </>
          )}
        </StyledView>
      </ScrollView>
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
        onPress={() => {
          // Handle saving the medication
          onClose(); // Close the form
        }}
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

export default MedTracking;
