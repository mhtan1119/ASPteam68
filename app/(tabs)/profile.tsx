import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import vector icons
import { StackScreenProps } from '@react-navigation/stack';

// Define the type for your stack's navigation
type RootStackParamList = {
  profile: undefined;
  editprofile: undefined;
};

// Define the type for the props in ProfilePage
type ProfilePageProps = StackScreenProps<RootStackParamList, 'profile'>;

export default function ProfilePage({ navigation }: ProfilePageProps) {
  const handleeditprofile = () => {
    // Navigate to the Edit Profile page
    navigation.navigate('editprofile'); // Ensure 'EditProfile' is the correct route name
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Hi, User!</Text>
          <TouchableOpacity onPress={() => navigation.navigate('editprofile')} style={styles.arrowContainer}>
            <Icon name="arrow-back" size={32} color="#3F5F90" style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>
      </View>
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
      <TouchableOpacity>
        <Text style={[styles.link, styles.signupLink]}>Login/Signup</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100, // Adjust to position content vertically
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, // Adjust spacing below profile section
  },
  profileImage: {
    width: 80, // Increased size
    height: 80, // Increased size
    borderRadius: 40, // Adjusted to maintain circular shape
    marginRight: 16,
  },
  greetingContainer: {
    alignItems: 'flex-start', // Align items to the start
    position: 'relative', // Position relative for the absolute positioning of arrow
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  arrowContainer: {
    marginTop: 8, // Space between text and arrow
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Center vertically
  },
  arrowIcon: {
    color: '#3F5F90', // Arrow color
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  link: {
    fontSize: 16, // Smaller font size for links
    color: '#808080', // Grey color for links
    marginVertical: 8,
  },
  signupLink: {
    color: '#3F5F90', // Specific color for Login/Signup link
    fontWeight: 'bold',
  },
});
