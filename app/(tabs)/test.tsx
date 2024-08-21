import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";

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

/// CLEARS THE DATABASE

// const initializeDatabase = async (db: any) => {
//   try {
//     // Drop the table if it exists
//     await db.execAsync(`
//       DROP TABLE IF EXISTS users;
//     `);

//     // Create the table again
//     await db.execAsync(`
//       PRAGMA journal_mode = WAL;
//       CREATE TABLE IF NOT EXISTS users (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         username TEXT UNIQUE,
//         password TEXT
//       );
//     `);
//     console.log("Database reset and initialized!");
//   } catch (error) {
//     console.log("Error while initializing the database:", error);
//   }
// };

export default function App() {
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
    <SQLiteProvider databaseName="auth.db" onInit={initializeDatabase}>
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

  const handleLogin = async () => {
    if (userName.length === 0 || password.length === 0) {
      Alert.alert("Attention", "Please enter both username and password");
      return;
    }
    try {
      const user = await db.getFirstAsync(
        "SELECT * FROM users WHERE username = ?",
        [userName]
      );
      if (!user) {
        Alert.alert("Error", "Username does not exist!");
        return;
      }
      const validUser = await db.getFirstAsync(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [userName, password]
      );
      if (validUser) {
        Alert.alert("Success", "Login successful");
        navigate("Home", userName);
        setUserName("");
        setPassword("");
      } else {
        Alert.alert("Error", "Incorrect password");
      }
    } catch (error) {
      console.log("Error during login:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <Pressable style={styles.link} onPress={() => navigate("Register")}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </Pressable>
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
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (
      userName.length === 0 ||
      password.length === 0 ||
      confirmPassword.length === 0
    ) {
      Alert.alert("Attention!", "Please enter all the fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Password do not match");
      return;
    }
    try {
      const existingUser = await db.getFirstAsync(
        "SELECT * FROM users WHERE username = ?",
        [userName]
      );
      if (existingUser) {
        Alert.alert("Error", "Username already exists.");
        return;
      }

      await db.runAsync(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [userName, password]
      );
      Alert.alert("Success", "Registration successful!");
      navigate("Home", userName);
    } catch (error) {
      console.log("Error during registration:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>
      <Pressable style={styles.link} onPress={() => navigate("Login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </Pressable>
    </View>
  );
};

// HomeScreen component
const HomeScreen: React.FC<{
  user: string;
  navigate: (screen: "Login" | "Register" | "Home") => void;
}> = ({ user, navigate }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.userText}>Welcome {user}!</Text>
      <Pressable style={styles.button} onPress={() => navigate("Login")}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 5,
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    marginVertical: 10,
    width: "80%",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: "blue",
  },
  userText: {
    fontSize: 18,
    marginBottom: 30,
  },
});
