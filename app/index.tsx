// Import necessary modules and components from React, React Native, and other libraries
import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import MaterialIcons for icons
import { Checkbox } from "react-native-paper"; // Import Checkbox component
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"; // Import SQLite for local database management
import { router } from "expo-router"; // Import router for navigation
import { styled } from "nativewind"; // Import styled components for NativeWind

// Custom Checkbox Component
const CustomCheckbox: React.FC<{ checked: boolean; onPress: () => void }> = ({
  checked,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
    <View style={styles.checkbox}>
      {checked && (
        <Icon name="check" size={18} color="#FFF" style={styles.checkmark} />
      )}
    </View>
  </TouchableOpacity>
);

// Initialize the SQLite database
const initializeDatabase = async (db: any) => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      );
    `);
    console.log("Database initialized!"); // Log success message
  } catch (error) {
    console.log("Error while initializing the database:", error); // Log error message if initialization fails
  }
};

// Main Login component
export default function Login() {
  const [currentScreen, setCurrentScreen] = useState<
    "Login" | "Register" | "Home"
  >("Login"); // State to manage the current screen
  const [userName, setUserName] = useState(""); // State to store the username

  // Function to handle navigation between screens
  const handleNavigation = (
    screen: "Login" | "Register" | "Home",
    user?: string
  ) => {
    setCurrentScreen(screen); // Update the current screen state
    if (user) {
      setUserName(user); // Update the username state if provided
    }
  };

  return (
    <SQLiteProvider databaseName="data.db" onInit={initializeDatabase}>
      {/* Render the appropriate screen based on the currentScreen state */}
      {currentScreen === "Login" && <LoginScreen navigate={handleNavigation} />}
      {currentScreen === "Register" && (
        <RegisterScreen navigate={handleNavigation} />
      )}
      {currentScreen === "Home" && (
        <HomeScreen user={userName} navigate={handleNavigation} />
      )}
    </SQLiteProvider>
  );
}

// LoginScreen component
const LoginScreen: React.FC<{
  navigate: (screen: "Login" | "Register" | "Home", user?: string) => void;
}> = ({ navigate }) => {
  const db = useSQLiteContext(); // Access SQLite context
  const [userName, setUserName] = useState(""); // State to store the username input
  const [password, setPassword] = useState(""); // State to store the password input
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [rememberMe, setRememberMe] = useState(false); // State to manage "Remember Me" option
  const [passwordError, setPasswordError] = useState<string | null>(null); // State to store password error message

  // Function to validate the password
  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/; // Regex pattern for password validation
    return passwordRegex.test(password);
  };

  // Function to handle login
  const handleLogin = async () => {
    if (!validatePassword(password)) {
      // Validate password format
      setPasswordError(
        "Password must be at least 8 characters long and include at least one uppercase letter and one special character."
      );
      return;
    }
    setPasswordError(""); // Clear the error message if validation passes

    if (userName.length === 0 || password.length === 0) {
      // Check for empty fields
      Alert.alert("Attention", "Please enter both email and password");
      return;
    }
    try {
      const user = await db.getFirstAsync(
        "SELECT * FROM users WHERE username = ?",
        [userName]
      ); // Check if the username exists
      if (!user) {
        Alert.alert("Error", "username does not exist!");
        return;
      }
      const validUser = await db.getFirstAsync(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [userName, password]
      ); // Validate username and password
      if (validUser) {
        Alert.alert("Success", "Login successful");
        router.navigate("/(tabs)/");
        setUserName("");
        setPassword("");
      } else {
        Alert.alert("Error", "Incorrect password");
      }
    } catch (error) {
      console.log("Error during login:", error); // Log error if login fails
    }
  };

  // Function to handle forgot password
  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Please contact support to reset your password."
    );
  };

  // Component rendering for LoginScreen
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 justify-center p-4 bg-white items-center mt-[-50px]">
        <Text className="text-[#3F5F90] text-2xl font-bold mb-6">Login</Text>
        {/* Email Input */}
        <View className="w-4/5 my-1">
          <Text className="font-bold text-lg mb-1">Email</Text>
          <TextInput
            className="p-2 border border-gray-300 rounded"
            placeholder="Enter your email"
            value={userName}
            onChangeText={setUserName}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {/* Password Input */}
        <View className="w-4/5 my-1">
          <Text className="font-bold text-lg mb-1">Password</Text>
          <View className="flex-row items-center border border-gray-300 rounded px-2">
            <TextInput
              className="flex-1 py-2"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? "visibility" : "visibility-off"}
                size={24}
                color="#000"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text className="text-red-500 text-sm mt-2">{`* ${passwordError}`}</Text>
          ) : null}
        </View>
        {/* Remember Me and Forgot Password */}
        <View className="w-4/5 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <CustomCheckbox
              checked={rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
            />
            <Text className="text-gray-700">Remember Me</Text>
          </View>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text className="text-[#007BFF] text-sm">Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        {/* Login Button */}
        <Pressable
          className="w-4/5 p-3 bg-customBlue2 rounded mt-3 items-center"
          onPress={handleLogin}
        >
          <Text className="text-white text-lg font-bold">Login</Text>
        </Pressable>
        {/* Sign Up Link */}
        <View className="flex-row mt-5">
          <Text className="text-base text-gray-500">
            Don't have an account?
          </Text>
          <Pressable className="ml-2" onPress={() => navigate("Register")}>
            <Text className="text-[#007BFF] text-base font-bold">Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

// RegisterScreen component
const RegisterScreen: React.FC<{
  navigate: (screen: "Login" | "Register" | "Home", user?: string) => void;
}> = ({ navigate }) => {
  const db = useSQLiteContext(); // Access SQLite context
  const [userName, setUserName] = useState(""); // State to store the username input
  const [password, setPassword] = useState(""); // State to store the password input
  const [repeatPassword, setRepeatPassword] = useState(""); // State to store repeated password input
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showRepeatPassword, setShowRepeatPassword] = useState(false); // State to toggle repeat password visibility
  const [passwordValid, setPasswordValid] = useState(true); // State to validate password
  const [passwordError, setPasswordError] = useState<string | null>(null); // State to store password error message

  // Function to validate the password
  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/; // Regex pattern for password validation
    return passwordRegex.test(password);
  };

  // Function to handle registration
  const handleRegister = async () => {
    if (password !== repeatPassword) {
      // Check if passwords match
      Alert.alert("Sign Up Failed", "Passwords do not match.");
      return;
    }
    if (
      userName.length === 0 ||
      password.length === 0 ||
      repeatPassword.length === 0
    ) {
      // Check for empty fields
      Alert.alert("Attention!", "Please enter all the fields.");
      return;
    }

    if (!validatePassword(password)) {
      // Validate password format
      setPasswordError(
        "Password must be at least 8 characters long and include at least one uppercase letter and one special character."
      );
      return;
    }
    setPasswordError(""); // Clear the error message if validation passes

    try {
      const existingUser = await db.getFirstAsync(
        "SELECT * FROM users WHERE username = ?",
        [userName]
      ); // Check if the username already exists
      if (existingUser) {
        Alert.alert("Error", "username already exists.");
        return;
      }

      await db.runAsync(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [userName, password]
      ); // Insert new user into the database
      Alert.alert("Success", "Registration successful!");
      router.navigate("/(tabs)/");
    } catch (error) {
      console.log("Error during registration:", error); // Log error if registration fails
    }
  };

  // Component rendering for RegisterScreen
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 justify-center p-4 bg-white items-center mt-[-50px]">
        <Text className="text-[#3F5F90] text-2xl font-bold mb-6">Sign Up</Text>
        {/* Email Input */}
        <View className="w-4/5 my-1">
          <Text className="font-bold text-lg mb-1">Email</Text>
          <TextInput
            className="p-2 border border-gray-300 rounded"
            placeholder="Enter your email"
            value={userName}
            onChangeText={setUserName}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {/* Password Input */}
        <View className="w-4/5 my-1">
          <Text className="font-bold text-lg mb-1">Password</Text>
          <View className="flex-row items-center border border-gray-300 rounded px-2">
            <TextInput
              className="flex-1 py-2"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validatePassword(text);
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? "visibility" : "visibility-off"}
                size={24}
                color="#000"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text className="text-red-500 text-sm mt-2">{`* ${passwordError}`}</Text>
          ) : null}
        </View>
        {/* Repeat Password Input */}
        <View className="w-4/5 my-1">
          <Text className="font-bold text-lg mb-1">Repeat Password</Text>
          <View className="flex-row items-center border border-gray-300 rounded px-2">
            <TextInput
              className="flex-1 py-2"
              placeholder="Repeat your password"
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              secureTextEntry={!showRepeatPassword}
            />
            <TouchableOpacity
              onPress={() => setShowRepeatPassword(!showRepeatPassword)}
            >
              <Icon
                name={showRepeatPassword ? "visibility" : "visibility-off"}
                size={24}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Sign Up Button */}
        <Pressable
          className="w-4/5 p-3 bg-customBlue2 rounded mt-3 items-center"
          onPress={handleRegister}
        >
          <Text className="text-white text-lg font-bold">Sign Up</Text>
        </Pressable>
        {/* Login Link */}
        <View className="flex-row mt-5">
          <Text className="text-base text-gray-500">
            Already have an account?
          </Text>
          <Pressable className="ml-2" onPress={() => navigate("Login")}>
            <Text className="text-[#007BFF] text-base font-bold">Log In</Text>
          </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

// HomeScreen component
const HomeScreen: React.FC<{
  user: string;
  navigate: (screen: "Login" | "Register" | "Home") => void;
}> = ({ user, navigate }) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 justify-center p-4 bg-white items-center mt-[-50px]">
        <Text className="text-[#3F5F90] text-2xl font-bold mb-6">
          Welcome, {user}
        </Text>
        {/* Logout Button */}
        <Pressable
          className="w-4/5 p-3 bg-customBlue2 rounded mt-3 items-center"
          onPress={() => navigate("Login")}
        >
          <Text className="text-white text-lg font-bold">Logout</Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
};

// Styles for components
const styles = StyleSheet.create({
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#3F5F90",
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#3F5F90",
  },
  checkmark: {
    color: "#3F5F90",
    fontSize: 14,
    lineHeight: 20,
  },
  checkboxText: {
    fontSize: 14,
    marginLeft: 5,
  },
  forgotPassword: {
    color: "#007BFF",
    fontSize: 14,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
});
