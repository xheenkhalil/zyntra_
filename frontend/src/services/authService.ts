// /frontend/src/services/authService.ts

import axios from 'axios';

// === Axios Client ===
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Added /api prefix
  withCredentials: true,
});

// === Utility: Safe error extraction ===
const extractErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: unknown }).response !== null
  ) {
    const response = (error as { response: { data?: unknown } }).response;
    if (
      'data' in response &&
      typeof response.data === 'object' &&
      response.data !== null &&
      'message' in (response.data as { message?: unknown })
    ) {
      return (response.data as { message?: string }).message;
    }
    if (typeof response.data === 'string') return response.data;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
};

// === LOGIN ===
export const login = async (credentials: { email?: string; password?: string, studentId?: string }) => {
  try {
    // This single endpoint handles both student and admin login
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error: unknown) {
    const message = extractErrorMessage(error, 'Login failed. Please check your credentials.');
    throw new Error(message);
  }
};

// === CHECK SESSION ===
export const checkSession = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error: unknown) {
    // We don't throw an error here, as a failed check is normal
    console.warn('Session check failed (likely not logged in):', error);
    throw new Error('No active session.');
  }
};

// === SETUP ACCOUNT ===
export const setupAccount = async (token: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/setup-account', { token, password });
    return response.data;
  } catch (error: unknown) {
    const message = extractErrorMessage(error, 'Account setup failed.');
    throw new Error(message);
  }
};

// === LOGOUT ===
export const apiLogout = async () => {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error: unknown) {
    const message = extractErrorMessage(error, 'Logout failed.');
    throw new Error(message);
  }
};

// ===========================================
// NEW: SETTINGS PAGE FUNCTIONS
// ===========================================

// --- Profile Data Type ---
interface ProfileData {
  fullName: string;
  email: string;
}

// --- Password Data Type ---
interface PasswordData {
  currentPassword: string;
  newPassword: string;
}

// === UPDATE PROFILE ===
export const updateMyProfile = async (data: ProfileData) => {
  try {
    // This calls the PUT /api/auth/profile route
    const response = await apiClient.put('/auth/profile', data);
    return response.data; // Returns { message: '...', user: {...} }
  } catch (error: unknown) {
    const message = extractErrorMessage(error, 'Failed to update profile.');
    throw new Error(message);
  }
};

// === CHANGE PASSWORD ===
export const changeMyPassword = async (data: PasswordData) => {
  try {
    // This calls the PUT /api/auth/change-password route
    const response = await apiClient.put('/auth/change-password', data);
    return response.data; // Returns { message: '...' }
  } catch (error: unknown) {
    const message = extractErrorMessage(error, 'Failed to change password.');
    throw new Error(message);
  }
};