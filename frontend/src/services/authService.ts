// /frontend/src/services/authService.ts

import axios from 'axios';

// === Axios Client ===
const apiClient = axios.create({
  baseURL: 'https://zyntraexams.onrender.com/api',
  withCredentials: true, // Ensures cookies are sent for session auth
  timeout: 10000, // 10 seconds to fail gracefully
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
export const login = async (credentials: { email: string; password: string }) => {
  try {
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
    const message = extractErrorMessage(error, 'Session check failed.');
    throw new Error(message);
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
