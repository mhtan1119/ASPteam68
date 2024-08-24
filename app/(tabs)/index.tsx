import { StatusBar } from "expo-status-bar";
import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import Checkbox from "expo-checkbox";
import * as SQLite from "expo-sqlite";

export default function App() {
  const [isChecked, setChecked] = useState(false);

  return (
    <View className="flex-1 flex-col py-10 bg-white">
      <StatusBar style="dark"></StatusBar>
      <View className="flex-row py-2 bg-customBeige">
        <Text className="ml-4 text-lg text-center">⚠️</Text>
        <Text className="grow text-lg text-center">
          Your <Text className="underline text-blue-500">next appointment</Text>{" "}
          is on 12/12/24 12:30PM
        </Text>
        <Text className="mr-4 text-lg text-center">✖</Text>
      </View>
      <View className="flex-row border-y-2 bg-customBlue">
        <Text className="grow ml-4 my-4 text-3xl font-bold">
          Health Summary
        </Text>
        <Text className="self-center mr-4">07/12/24 08:23 AM</Text>
      </View>
      <View className="ml-8 my-4 space-y-4">
        <Text className="text-lg">Age: 30</Text>
        <Text className="text-lg">Allergies & Reactions: N/A</Text>
        <Text className="text-lg">Blood Type: AB+</Text>
        <Text className="text-lg">Height: 170cm</Text>
        <Text className="text-lg">Weight: 65kg</Text>
      </View>
      <View className="border-t-2">
        <Text className="ml-8 mt-8 text-2xl font-bold">Today's Medication</Text>
      </View>
      <View className="flex-row ml-16 my-8">
        <View className="space-y-5">
          <Checkbox
            className="mr-2"
            value={isChecked}
            onValueChange={setChecked}
          />
          <Checkbox className="" value={isChecked} onValueChange={setChecked} />
          <Checkbox className="" value={isChecked} onValueChange={setChecked} />
        </View>
        <View className="grow space-y-4">
          <Text className="text-lg">Paracetamol, 500mg</Text>
          <Text className="text-lg">Ibuprofen, 400mg</Text>
          <Text className="text-lg">Metformin, 500mg</Text>
        </View>
        <View className="mr-16 space-y-4">
          <Text className="text-lg">08:00 AM</Text>
          <Text className="text-lg">08:00 AM</Text>
          <Text className="text-lg">07:30 PM</Text>
        </View>
      </View>
      <View className="border-y-2 bg-customBlue">
        <Text className="ml-4 my-4 text-3xl font-bold">
          Recently Taken Pills
        </Text>
      </View>
      <View className="flex-row ml-8 mt-8">
        <View className="grow space-y-4">
          <Text className="text-lg">Paracetamol, 500mg</Text>
          <Text className="text-lg">Lisinopril, 10mg</Text>
          <Text className="text-lg">Metformin, 500mg</Text>
        </View>
        <View className="mr-8 space-y-4">
          <Text className="text-lg">07/12/24 08:12 AM</Text>
          <Text className="text-lg">06/12/24 10:24 PM</Text>
          <Text className="text-lg">06/12/24 07:36 PM</Text>
        </View>
      </View>
    </View>
  );
}
