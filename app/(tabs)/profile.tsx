import React, { useState } from "react";
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
import Icon from 'react-native-vector-icons/Ionicons';
import { RadioButton } from 'react-native-paper';
import DateTimePicker, { Event } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

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

  const handleDateChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(false);
    setDateOfBirth(currentDate);
  };

  const handleSave = () => {
    // Handle save logic here
    Alert.alert("Profile Updated", "Your profile has been updated.");
    setEditing(false); // Switch back to profile view
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!editing ? (
        <View style={styles.profileContainer}>
          <View style={styles.headerContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Hi, User!</Text>
              <Pressable style={styles.editButton} onPress={() => setEditing(true)}>
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
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.profileImageLarge}
            />
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
                  status={gender === 'male' ? 'checked' : 'unchecked'}
                  onPress={() => setGender('male')}
                  color="#3F5F90"
                />
                <Text style={styles.radioText}>Male</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton
                  value="female"
                  status={gender === 'female' ? 'checked' : 'unchecked'}
                  onPress={() => setGender('female')}
                  color="#3F5F90"
                />
                <Text style={styles.radioText}>Female</Text>
              </View>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
              <Icon name="calendar-outline" size={20} color="#3F5F90" style={styles.calendarIcon} />
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40, // Add margin top to move the content down
  },
  profilePicContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  settingsContainer: {
    width: '100%',
    paddingLeft: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
  },
  greetingContainer: {
    alignItems: 'flex-start',
    position: 'relative',
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  link: {
    fontSize: 16,
    color: '#808080',
    marginVertical: 8,
  },
  editView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  columnContainer: {
    width: '48%',
  },
  columnSpacing: {
    marginLeft: '4%',
  },
  radioContainer: {
    flexDirection: 'row',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioText: {
    fontSize: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  calendarIcon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#3F5F90',
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: "#3F5F90",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12, // Adjusted padding
    alignSelf: 'center',  // Centers the button horizontally
  },
});

export default ProfileEditPage;
