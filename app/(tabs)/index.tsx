import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Pressable, Alert, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Checkbox } from 'react-native-paper';
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

export default function Login() {
  const [currentScreen, setCurrentScreen] = useState<"Login" | "Register" | "Home">("Login");
  const [userName, setUserName] = useState("");

  const handleNavigation = (screen: "Login" | "Register" | "Home", user?: string) => {
    setCurrentScreen(screen);
    if (user) {
      setUserName(user);
    }
  };

  return (
    <SQLiteProvider databaseName="auth.db" onInit={initializeDatabase}>
      {currentScreen === "Login" && <LoginScreen navigate={handleNavigation} />}
      {currentScreen === "Register" && <RegisterScreen navigate={handleNavigation} />}
      {currentScreen === "Home" && <HomeScreen user={userName} navigate={handleNavigation} />}
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
      setPasswordError("Password must be at least 8 characters long and include at least one uppercase letter and one special character.");
      return;
    }
    setPasswordError(""); // Clear the error message if validation passes

    if (userName.length === 0 || password.length === 0) {
      Alert.alert("Attention", "Please enter both email and password");
      return;
    }
    try {
      const user = await db.getFirstAsync("SELECT * FROM users WHERE username = ?", [userName]);
      if (!user) {
        Alert.alert("Error", "username does not exist!");
        return;
      }
      const validUser = await db.getFirstAsync("SELECT * FROM users WHERE username = ? AND password = ?", [userName, password]);
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

  const handleForgotPassword = () => {
    Alert.alert("Forgot Password", "Please contact support to reset your password.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={userName}
          onChangeText={setUserName}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={styles.passwordError}>{`* ${passwordError}`}</Text>
        ) : null}
      </View>
      <View style={styles.checkboxContainer}>
        <View style={styles.checkboxRow}>
          <Checkbox
            status={rememberMe ? 'checked' : 'unchecked'}
            onPress={() => setRememberMe(!rememberMe)}
          />
          <Text style={styles.checkboxLabel}>Remember Me</Text>
        </View>
        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordLink}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <View style={styles.signUpContainer}>
        <Text style={styles.linkText1}>Don't have an account?</Text>
        <Pressable style={styles.link} onPress={() => navigate("Register")}>
          <Text style={styles.linkText}> Sign Up </Text>
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
      setPasswordError("Password must be at least 8 characters long and include at least one uppercase letter and one special character.");
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
      navigate("Home", userName);
    } catch (error) {
      console.log("Error during registration:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={userName}
          onChangeText={setUserName}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput} 
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              validatePassword(text);
            }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={styles.passwordError}>{`* ${passwordError}`}</Text>
        ) : null}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Repeat Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Repeat your password"
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            secureTextEntry={!showRepeatPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowRepeatPassword(!showRepeatPassword)}
          >
            <Icon
              name={showRepeatPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        </View>
      </View>
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>
      <View style={styles.signUpContainer}>
        <Text style={styles.linkText1}>Already have an account?</Text>
        <Pressable style={styles.link} onPress={() => navigate("Login")}>
          <Text style={styles.linkText}> Log In </Text>
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
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user}</Text>
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
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    marginTop: -50, 
  },
  title: {
    color: '#3F5F90',
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  inputContainer: {
    width: "80%",
    marginVertical: 5,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    padding: 10,
    marginLeft: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 5,
  },
  forgotPasswordLink: {
    marginLeft: 16,
    paddingVertical: 5,
  },
  forgotPasswordText: {
    color: "#007BFF",
    fontSize: 14,
    textAlign: 'right',
  },
  button: {
    width: "80%",
    padding: 10,
    backgroundColor: "#3F5F90",
    borderRadius: 5,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  link: {
    color: '#808080',
    marginLeft: 5,
  },
  linkText1: {
    fontSize: 16,
    color: '#808080',
  },
  linkText: {
    fontSize: 16,
    color: "#007BFF",
    fontWeight: "bold",
  },
  passwordError: {
    fontSize: 14,
    color: "red",
    marginTop: 5,
  },
});

