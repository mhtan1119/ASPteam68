import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Checkbox } from "react-native-paper";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { styled } from "nativewind";

// Initialize the database
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
    console.log("Database initialized!");
  } catch (error) {
    console.log("Error while initializing the database:", error);
  }
};

export default function Login() {
  const [currentScreen, setCurrentScreen] = useState<
    "Login" | "Register" | "Home"
  >("Login");
  const [userName, setUserName] = useState("");

  const handleNavigation = (
    screen: "Login" | "Register" | "Home",
    user?: string
  ) => {
    setCurrentScreen(screen);
    if (user) {
      setUserName(user);
    }
  };

  return (
    <SQLiteProvider databaseName="data.db" onInit={initializeDatabase}>
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
  const db = useSQLiteContext();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleLogin = async () => {
    if (!validatePassword(password)) {
      setPasswordError(
        "Password must be at least 8 characters long and include at least one uppercase letter and one special character."
      );
      return;
    }
    setPasswordError(""); // Clear the error message if validation passes

    if (userName.length === 0 || password.length === 0) {
      Alert.alert("Attention", "Please enter both email and password");
      return;
    }
    try {
      const user = await db.getFirstAsync(
        "SELECT * FROM users WHERE username = ?",
        [userName]
      );
      if (!user) {
        Alert.alert("Error", "username does not exist!");
        return;
      }
      const validUser = await db.getFirstAsync(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [userName, password]
      );
      if (validUser) {
        Alert.alert("Success", "Login successful");
        router.navigate("/(tabs)/");
        setUserName("");
        setPassword("");
      } else {
        Alert.alert("Error", "Incorrect password");
      }
    } catch (error) {
      console.log("Error during login:", error);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Please contact support to reset your password."
    );
  };

  return (
    <View className="flex-1 justify-center p-4 bg-white items-center mt-[-50px]">
      <Text className="text-[#3F5F90] text-2xl font-bold mb-6">Login</Text>
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
      <View className="w-4/5 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Checkbox
            status={rememberMe ? "checked" : "unchecked"}
            onPress={() => setRememberMe(!rememberMe)}
          />
          <Text className="text-sm ml-2">Remember Me</Text>
        </View>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text className="text-[#007BFF] text-sm">Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      <Pressable
        className="w-4/5 p-3 bg-customBlue2 rounded mt-3 items-center"
        onPress={handleLogin}
      >
        <Text className="text-white text-lg font-bold">Login</Text>
      </Pressable>
      <View className="flex-row mt-5">
        <Text className="text-base text-gray-500">Don't have an account?</Text>
        <Pressable className="ml-2" onPress={() => navigate("Register")}>
          <Text className="text-[#007BFF] text-base font-bold">Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
};

// RegisterScreen component
const RegisterScreen: React.FC<{
  navigate: (screen: "Login" | "Register" | "Home", user?: string) => void;
}> = ({ navigate }) => {
  const db = useSQLiteContext();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState(true);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleRegister = async () => {
    if (password !== repeatPassword) {
      Alert.alert("Sign Up Failed", "Passwords do not match.");
      return;
    }
    if (
      userName.length === 0 ||
      password.length === 0 ||
      repeatPassword.length === 0
    ) {
      Alert.alert("Attention!", "Please enter all the fields.");
      return;
    }

    if (!validatePassword(password)) {
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
      );
      if (existingUser) {
        Alert.alert("Error", "username already exists.");
        return;
      }

      await db.runAsync(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [userName, password]
      );
      Alert.alert("Success", "Registration successful!");
      router.navigate("/(tabs)/");
    } catch (error) {
      console.log("Error during registration:", error);
    }
  };

  return (
    <View className="flex-1 justify-center p-4 bg-white items-center mt-[-50px]">
      <Text className="text-[#3F5F90] text-2xl font-bold mb-6">Sign Up</Text>
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
      <Pressable
        className="w-4/5 p-3 bg-customBlue2 rounded mt-3 items-center"
        onPress={handleRegister}
      >
        <Text className="text-white text-lg font-bold">Sign Up</Text>
      </Pressable>
      <View className="flex-row mt-5">
        <Text className="text-base text-gray-500">
          Already have an account?
        </Text>
        <Pressable className="ml-2" onPress={() => navigate("Login")}>
          <Text className="text-[#007BFF] text-base font-bold">Log In</Text>
        </Pressable>
      </View>
    </View>
  );
};

// HomeScreen component
const HomeScreen: React.FC<{
  user: string;
  navigate: (screen: "Login" | "Register" | "Home") => void;
}> = ({ user, navigate }) => {
  return (
    <View className="flex-1 justify-center p-4 bg-white items-center mt-[-50px]">
      <Text className="text-[#3F5F90] text-2xl font-bold mb-6">
        Welcome, {user}
      </Text>
      <Pressable
        className="w-4/5 p-3 bg-customBlue2 rounded mt-3 items-center"
        onPress={() => navigate("Login")}
      >
        <Text className="text-white text-lg font-bold">Logout</Text>
      </Pressable>
    </View>
  );
};
