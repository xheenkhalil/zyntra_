// /frontend/src/config.ts

// Define the base URL for your backend API
// This should point to where your backend server is running.
// For local development, it's usually http://localhost:5000 (or whatever port your backend uses)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; 
// export const API_BASE_URL = 'http://localhost:5000'; // Alternative if you don't use Vite .env variables