// Import a mock implementation of AsyncStorage for testing purposes
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

// Import additional matchers for testing React Native components
import "@testing-library/jest-native/extend-expect";

// Mock the AsyncStorage module with the mock implementation
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

// Mock the Expo SQLite module to prevent actual database operations during testing
jest.mock("expo-sqlite");
