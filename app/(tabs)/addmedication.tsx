import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddMedication = () => {
  const [medicationName, setMedicationName] = useState('');
  const [dosageStrength, setDosageStrength] = useState('');
  const [unit, setUnit] = useState('mg');
  const [dosageForm, setDosageForm] = useState('');
  const [time, setTime] = useState(new Date());
  const [showFormPicker, setShowFormPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onTimeChange = (event: any, selectedTime: Date | undefined) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
  };

  const formatTime = (time: Date) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.label}>Name of Medication</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter medication name"
          value={medicationName}
          onChangeText={setMedicationName}
        />

        <Text style={styles.label}>Dosage Strength</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter dosage strength"
          value={dosageStrength}
          onChangeText={setDosageStrength}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Choose Unit</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowUnitPicker(true)}
        >
          <Text style={styles.buttonText}>{unit}</Text>
        </TouchableOpacity>

        <Modal visible={showUnitPicker} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
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
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowUnitPicker(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Text style={styles.label}>Dosage Form</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowFormPicker(true)}
        >
          <Text style={styles.buttonText}>
            {dosageForm || 'Select dosage form'}
          </Text>
        </TouchableOpacity>

        <Modal visible={showFormPicker} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
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
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFormPicker(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Text style={styles.label}>Time to be Taken</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.buttonText}>{formatTime(time)}</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={onTimeChange}
            style={styles.dateTimePicker}
          />
        )}

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Medication</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddMedication;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  button: {
    height: 40,
    backgroundColor: '#83B4FF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#83B4FF',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    width: '80%',
    borderRadius: 8,
    padding: 16,
  },
  closeButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dateTimePicker: {
    width: '100%',
    backgroundColor: 'transparent',
  },
});
