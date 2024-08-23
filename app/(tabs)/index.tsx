import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";

const UserListScreen: React.FC = () => {
  const db = useSQLiteContext();
  const [nextAppointment, setNextAppointment] = useState<{
    date: string;
    time: string;
  } | null>(null);

  const fetchAppointments = async () => {
    try {
      const result = await db.getAllAsync(
        "SELECT date, time FROM appointments ORDER BY date ASC, time ASC LIMIT 1;"
      );
      const appointmentList = (result as { date: string; time: string }[]).map(
        (row) => ({
          date: row.date,
          time: row.time,
        })
      );

      // Set the earliest appointment as the next appointment
      if (appointmentList.length > 0) {
        setNextAppointment(appointmentList[0]);
      }
    } catch (error) {
      console.log("Error fetching appointments:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  return (
    <View style={styles.container}>
      {nextAppointment && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Your next appointment is on: {nextAppointment.date} at{" "}
            {nextAppointment.time}
          </Text>
        </View>
      )}
    </View>
  );
};

const App: React.FC = () => {
  return (
    <SQLiteProvider databaseName="appointment6.db">
      <UserListScreen />
    </SQLiteProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  banner: {
    backgroundColor: "#ffcc00",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  bannerText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default App;
