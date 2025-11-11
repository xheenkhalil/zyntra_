/** @type {import('tailwindcss').Config} */
module.exports = {
  // This is the key setting for MUI compatibility
  important: true,
  
  // This tells Tailwind where to look for its class names
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  
  theme: {
    extend: {},
  },
  
  // This is the other key setting for MUI compatibility
  corePlugins: {
    preflight: false,
  },
  
  plugins: [],
}