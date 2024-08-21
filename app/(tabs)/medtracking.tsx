import React, { useState } from 'react';
import { SafeAreaView, TouchableOpacity, Text, View } from 'react-native';

const Index = () => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const currentDayIndex = today.getDay();

  const orderedDays = [
    daysOfWeek[(currentDayIndex + 6) % 7],
    daysOfWeek[(currentDayIndex + 5) % 7],
    daysOfWeek[currentDayIndex], // Current day (middle day)
    daysOfWeek[(currentDayIndex + 1) % 7],
    daysOfWeek[(currentDayIndex + 2) % 7],
  ];

  const [selectedDayIndex, setSelectedDayIndex] = useState(2); // Start with the middle day selected
  const [firstMedicationStatus, setFirstMedicationStatus] = useState<string>(''); // '', 'tick', 'cross'
  const [secondMedicationStatus, setSecondMedicationStatus] = useState<string>(''); // '', 'tick', 'cross'

  const handleDayPress = (index: number) => {
    setSelectedDayIndex(index);
  };

  const toggleStatus = (status: string, setStatus: React.Dispatch<React.SetStateAction<string>>) => {
    if (status === '') {
      setStatus('tick');
    } else if (status === 'tick') {
      setStatus('cross');
    } else {
      setStatus('');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 bg-white items-center">
        {/* Date Display */}
        <Text className="text-lg text-black mb-4 text-center">
          Today, {orderedDays[selectedDayIndex]}, {today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </Text>

        {/* Day Circles */}
        <View className="flex-row justify-between mb-4 w-full max-w-xs">
          {orderedDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index === selectedDayIndex ? 'bg-[#83B4FF]' : 'bg-black'
              }`}
              onPress={() => handleDayPress(index)}
            >
              <Text className="text-white">{day.slice(0, 3)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Medication Button */}
        <TouchableOpacity className="bg-[#83B4FF] py-3 px-6 rounded-lg mt-4 shadow-lg">
          <Text className="text-white text-center font-bold">
            <Text className="text-lg font-bold mr-2">+</Text> Add Medication
          </Text>
        </TouchableOpacity>

        {/* Time Label */}
        <Text className="mt-4 text-lg font-bold text-black self-start">8:30</Text>

        {/* Medication Items */}
        <View className="mt-2 w-full">
          <TouchableOpacity className="bg-[#E5F0FF] py-3 px-4 rounded-lg mt-2 flex-row items-center shadow-md">
            <TouchableOpacity
              className="w-7 h-7 rounded-md border border-black flex items-center justify-center mr-4"
              onPress={() => toggleStatus(firstMedicationStatus, setFirstMedicationStatus)}
            >
              <Text className="text-lg">
                {firstMedicationStatus === 'tick' ? '✔️' : firstMedicationStatus === 'cross' ? '❌' : ''}
              </Text>
            </TouchableOpacity>
            <Text className="text-base text-black">Paracetamol, 250 mg</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-[#E5F0FF] py-3 px-4 rounded-lg mt-2 flex-row items-center shadow-md">
            <TouchableOpacity
              className="w-7 h-7 rounded-md border border-black flex items-center justify-center mr-4"
              onPress={() => toggleStatus(secondMedicationStatus, setSecondMedicationStatus)}
            >
              <Text className="text-lg">
                {secondMedicationStatus === 'tick' ? '✔️' : secondMedicationStatus === 'cross' ? '❌' : ''}
              </Text>
            </TouchableOpacity>
            <Text className="text-base text-black">Losartan, 400 mg</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Index;
