// /frontend/src/services/authService.ts

import axios from 'axios';

// === Axios Client ===
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Ensures cookies are sent for session auth
  timeout: 10000, // 10 seconds to fail gracefully
});

// === Utility: Safe error extraction ===
const extractErrorMessage = (error: any, fallback: string) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (typeof error?.response?.data === 'string') return error.response.data;
  if (error?.message) return error.message;
  return fallback;
};

// === LOGIN ===
export const login = async (credentials: { email: string; password: string }) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    const message = extractErrorMessage(error, 'Login failed. Please check your credentials.');
    throw new Error(message);
  }
};

// === CHECK SESSION ===
export const checkSession = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error: any) {
    const message = extractErrorMessage(error, 'Session check failed.');
    throw new Error(message);
  }
};

// === SETUP ACCOUNT ===
export const setupAccount = async (token: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/setup-account', { token, password });
    return response.data;
  } catch (error: any) {
    const message = extractErrorMessage(error, 'Account setup failed.');
    throw new Error(message);
  }
};

// === LOGOUT ===
export const apiLogout = async () => {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error: any) {
    const message = extractErrorMessage(error, 'Logout failed.');
    throw new Error(message);
  }
};
