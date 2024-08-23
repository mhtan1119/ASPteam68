/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}", // Include all JS, JSX, TS, and TSX files in the app folder
    "./components/**/*.{js,jsx,ts,tsx}", // Include all JS, JSX, TS, and TSX files in the components folder
    "./app/(tabs)/meditate.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        rmono: ["Roboto-Mono", "sans-serif"],
      },
      colors: {
        customBlue: "#83B9FF", // Define your custom color here
        customBlue2: "#3F5F90", // Newly added color
        customBeige: "#FDFFE2", // Newly added color
      },
    },
  },
  plugins: [],
};
