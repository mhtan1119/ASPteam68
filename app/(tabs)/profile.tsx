import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Platform,
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileEditPage: React.FC = () => {
  const [editing, setEditing] = useState(false);

  // Displayed profile state
  const [displayFullName, setDisplayFullName] = useState("");
  const [displayProfileImage, setDisplayProfileImage] = useState<string | null>(
    null
  );

  // Editable profile state
  const [fullName, setFullName] = useState("");
  const [selectedGender, setSelectedGender] = useState("male");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    fullName: "",
    phoneNumber: "",
    height: "",
    weight: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem("userProfile");
        if (profileData) {
          const data = JSON.parse(profileData);
          setFullName(data.fullName || "");
          setSelectedGender(data.gender || "male");
          setDateOfBirth(new Date(data.dateOfBirth) || new Date());
          setHeight(data.height || "");
          setWeight(data.weight || "");
          setBloodType(data.bloodType || "");
          setAllergies(data.allergies || "");
          setPhoneNumber(data.phoneNumber || "");
          setAddress(data.address || "");
          setProfileImage(data.profileImage || null);

          // Update the displayed state as well
          setDisplayFullName(data.fullName || "");
          setDisplayProfileImage(data.profileImage || null);
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
    validateFullName(fullName);
    validatePhoneNumber(phoneNumber);
    if (!errors.fullName && !errors.phoneNumber) {
      try {
        const profileData = {
          fullName,
          selectedGender,
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
        setEditing(false);

        // Update the displayed state after saving
        setDisplayFullName(fullName);
        setDisplayProfileImage(profileImage);
      } catch (error) {
        console.error("Error saving profile data", error);
      }
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

  const validateFullName = (fullName: string) => {
    let error = "";
    if (fullName.trim() === "") {
      error = "Full name is required.";
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      fullName: error,
    }));
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    let error = "";
    const phonePattern = /^[0-9]{8}$/;

    if (!phonePattern.test(phoneNumber)) {
      error = "Phone number must be exactly 8 digits.";
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      phoneNumber: error,
    }));
  };

  const handleFullNameChange = (text: string) => {
    setFullName(text);
    validateFullName(text);
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    validatePhoneNumber(text);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!editing ? (
        <View style={styles.profileContainer}>
          <View style={styles.headerContainer}>
            <Image
              source={{
                uri: displayProfileImage || "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
            />
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Hi, {displayFullName}!</Text>
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
              style={[styles.input, errors.fullName ? styles.errorInput : null]}
              placeholder="Enter full name"
              value={fullName}
              onChangeText={handleFullNameChange}
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>
          <View style={styles.inputContainer}>
  <Text style={styles.label}>Gender</Text>
  <View style={styles.radioContainer}>
    <TouchableOpacity
      style={[
        styles.radioButton,
        selectedGender === 'male' && styles.selectedRadioButton,
      ]}
      onPress={() => setSelectedGender('male')}
    >
      <View
        style={[
          styles.radioCircle,
          selectedGender === 'male' && styles.selectedRadioCircle,
        ]}
      />
      <Text style={styles.radioText}>Male</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        styles.radioButton,
        selectedGender === 'female' && styles.selectedRadioButton,
      ]}
      onPress={() => setSelectedGender('female')}
    >
      <View
        style={[
          styles.radioCircle,
          selectedGender === 'female' && styles.selectedRadioCircle,
        ]}
      />
      <Text style={styles.radioText}>Female</Text>
    </TouchableOpacity>
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
                style={[styles.input, errors.height ? styles.errorInput : null]}
                keyboardType="numeric"
                placeholder="Enter height"
                value={height}
                onChangeText={setHeight}
              />
              {errors.height && (
                <Text style={styles.errorText}>{errors.height}</Text>
              )}
            </View>
            <View style={[styles.columnContainer, styles.columnSpacing]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={[styles.input, errors.weight ? styles.errorInput : null]}
                keyboardType="numeric"
                placeholder="Enter weight"
                value={weight}
                onChangeText={setWeight}
              />
              {errors.weight && (
                <Text style={styles.errorText}>{errors.weight}</Text>
              )}
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
              style={[
                styles.input,
                errors.phoneNumber ? styles.errorInput : null,
              ]}
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              keyboardType="phone-pad"
              maxLength={8}
            />
            {errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}
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
    paddingTop: 10, // Added paddingTop for iOS
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
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: Platform.OS === 'ios' ? 50 : 40, // Adjusted height for iOS
    justifyContent: 'center',
    width: "100%",
    paddingLeft: 10,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedRadioButton: {
    backgroundColor: '#e0e0e0',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333', // Default border color
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioCircle: {
    borderColor: '#3F5F90', // Change this color to your desired color
  },
  radioText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
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
  errorInput: {
    borderColor: "red", // Red border to indicate an error
    borderWidth: 1, // Border width
  },

  // Style for error text
  errorText: {
    color: "red", // Red color for error text
    fontSize: 12, // Font size
    marginTop: 4, // Margin to separate from the input field
  },

});

export default ProfileEditPage;
