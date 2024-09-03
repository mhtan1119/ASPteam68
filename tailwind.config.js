/** @type {import('tailwindcss').Config} */
module.exports = {
  // Define the content files that Tailwind CSS should scan for class names
  content: [
    "./App.{js,jsx,ts,tsx}", // Include the main App file in JS, JSX, TS, or TSX format
    "./app/**/*.{js,jsx,ts,tsx}", // Include all files in the 'app' directory with JS, JSX, TS, or TSX extensions
    "./components/**/*.{js,jsx,ts,tsx}", // Include all files in the 'components' directory with JS, JSX, TS, or TSX extensions
  ],
  theme: {
    extend: {
      // Extend default Tailwind CSS settings to add custom configurations
      fontFamily: {
        // Add custom font families
        rmono: ["Roboto-Mono", "sans-serif"], // Add 'Roboto-Mono' font with 'sans-serif' as fallback
      },
      colors: {
        // Add custom color palette
        customBlue: "#83B9FF",
        customBlue2: "#3F5F90",
        customBeige: "#FDFFE2",
      },
    },
  },
  plugins: [],
};
