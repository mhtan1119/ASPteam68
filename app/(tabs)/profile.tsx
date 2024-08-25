import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { RadioButton } from "react-native-paper";
import DateTimePicker, { Event } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileEditPage: React.FC = () => {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("male");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem("userProfile");
        if (profileData) {
          const data = JSON.parse(profileData);
          setFullName(data.fullName || "");
          setGender(data.gender || "male");
          setDateOfBirth(new Date(data.dateOfBirth) || new Date());
          setHeight(data.height || "");
          setWeight(data.weight || "");
          setBloodType(data.bloodType || "");
          setAllergies(data.allergies || "");
          setPhoneNumber(data.phoneNumber || "");
          setAddress(data.address || "");
          setProfileImage(data.profileImage || null);
        }
      } catch (error) {
        console.error("Error loading profile data", error);
      }
    };

    loadProfile();
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(false);
    setDateOfBirth(currentDate);
  };

  const handleSave = async () => {
    try {
      const profileData = {
        fullName,
        gender,
        dateOfBirth: dateOfBirth.toISOString(), // Save date as ISO string
        height,
        weight,
        bloodType,
        allergies,
        phoneNumber,
        address,
        profileImage,
      };

      await AsyncStorage.setItem("userProfile", JSON.stringify(profileData));
      Alert.alert("Profile Updated", "Your profile has been updated.");
      setEditing(false); // Switch back to profile view
    } catch (error) {
      console.error("Error saving profile data", error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0]?.uri;
      setProfileImage(imageUri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!editing ? (
        <View style={styles.profileContainer}>
          <View style={styles.headerContainer}>
            <Image
              source={{
                uri: profileImage || "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
            />
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Hi, {fullName}!</Text>
              <Pressable
                style={styles.editButton}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>General</Text>
            <TouchableOpacity>
              <Text style={styles.link}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.link}>Accessibility</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.link}>Theme</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.link}>Emergency Contact Information</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.editView}>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={styles.profilePicContainer}>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={{
                  uri: profileImage || "https://via.placeholder.com/150",
                }}
                style={styles.profileImageLarge}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.radioContainer}>
              <View style={styles.radioButton}>
                <RadioButton
                  value="male"
                  status={gender === "male" ? "checked" : "unchecked"}
                  onPress={() => setGender("male")}
                  color="#3F5F90"
                />
                <Text style={styles.radioText}>Male</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton
                  value="female"
                  status={gender === "female" ? "checked" : "unchecked"}
                  onPress={() => setGender("female")}
                  color="#3F5F90"
                />
                <Text style={styles.radioText}>Female</Text>
              </View>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon
                name="calendar-outline"
                size={20}
                color="#3F5F90"
                style={styles.calendarIcon}
              />
              <Text style={styles.dateText}>{dateOfBirth.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
          <View style={styles.rowContainer}>
            <View style={styles.columnContainer}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter height"
                value={height}
                onChangeText={setHeight}
              />
            </View>
            <View style={[styles.columnContainer, styles.columnSpacing]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter weight"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Blood Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={bloodType}
                onValueChange={(itemValue) => setBloodType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select blood type" value="" />
                <Picker.Item label="A" value="A" />
                <Picker.Item label="B" value="B" />
                <Picker.Item label="AB" value="AB" />
                <Picker.Item label="O" value="O" />
              </Picker>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Allergies</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe any allergies"
              numberOfLines={4}
              value={allergies}
              onChangeText={setAllergies}
              multiline
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={8}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter your address"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>
          <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => setEditing(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  profileContainer: {
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40, // Add margin top to move the content down
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#3F5F90",
  },
  greetingContainer: {
    marginLeft: 20,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#3F5F90",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  settingsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  link: {
    fontSize: 16,
    color: "#808080",
    marginBottom: 10,
  },
  editView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  profilePicContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#3F5F90",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    height: 80,
    textAlignVertical: "top",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  calendarIcon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  columnContainer: {
    flex: 1,
  },
  columnSpacing: {
    marginLeft: 10,
  },
  pickerContainer: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    overflow: "hidden",
  },
  picker: {
    height: 40,
    width: "100%",
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioText: {
    fontSize: 16,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#3F5F90",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
});

export default ProfileEditPage;
