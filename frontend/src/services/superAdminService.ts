// /frontend/src/services/superAdminService.ts

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Use the env var and add /api prefix
  withCredentials: true,
});

// =====================================
// NEW: DASHBOARD, ANALYTICS, & SYSTEM
// =====================================

// --- Task 2: System Status ---
export const getSystemStatus = async () => {
  // Note: This route is /api/system, not /api/superadmin
  const response = await apiClient.get('/system/status');
  return response.data;
};

// --- Task 3: Dashboard Analytics ---
export const getDashboardStats = async () => {
  const response = await apiClient.get('/superadmin/stats');
  return response.data;
};

export const getUserGrowthChart = async (range: string) => {
  const response = await apiClient.get('/superadmin/charts/user-growth', {
    params: { range }
  });
  return response.data;
};

export const getSystemPerformanceChart = async () => {
  const response = await apiClient.get('/superadmin/charts/performance');
  return response.data;
};

export const getActivityFeed = async () => {
  const response = await apiClient.get('/superadmin/activity-feed');
  return response.data;
};

// =====================================
// NEW: USER MANAGEMENT (TASK 5)
// =====================================

interface UserFilters {
  role?: string;
  organizationId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getAllUsers = async (filters: UserFilters = {}) => {
  const response = await apiClient.get('/superadmin/users', {
    params: filters
  });
  return response.data;
};

export const updateUserStatus = async (id: string, status: 'active' | 'archived') => {
  const response = await apiClient.put(`/superadmin/users/${id}/status`, { status });
  return response.data;
};

export const updateUserRole = async (id: string, role: string) => {
  const response = await apiClient.put(`/superadmin/users/${id}/role`, { role });
  return response.data;
};


// =====================================
// EXISTING ORGANIZATION & ADMIN MGMT
// =====================================

// === READ ===
export const getOrganizations = async () => {
    const response = await apiClient.get('/superadmin/organizations');
    return response.data;
};

// === CREATE ===
export const createOrganization = async (name: string) => {
    const response = await apiClient.post('/superadmin/organizations', { name });
    return response.data;
};

// === UPDATE ===
export const updateOrganization = async (id: string, name: string) => {
    const response = await apiClient.put(`/superadmin/organizations/${id}`, { name });
    return response.data;
};

// === ARCHIVE (SOFT DELETE) ===
export const archiveOrganization = async (id: string) => {
    const response = await apiClient.put(`/superadmin/organizations/${id}/archive`);
    return response.data;
};

// === UNARCHIVE (RESTORE) ===
export const unarchiveOrganization = async (id: string) => {
    const response = await apiClient.put(`/superadmin/organizations/${id}/unarchive`);
    console.log('Unarchive response:', response.data);
    return response.data;
};

// === DELETE (HARD DELETE) ===
export const deleteOrganization = async (id: string) => {
    const response = await apiClient.delete(`/superadmin/organizations/${id}`);
    return response.data;
};

// === CREATE CENTRAL ADMIN (NEW FUNCTION) ===
export const createCentralAdmin = async (data: { fullName: string; email: string; username: string; organizationId: string; }) => {
    const response = await apiClient.post('/superadmin/central-admins', data);
    return response.data;
};

// === SEND INVITE EMAIL TO CENTRAL ADMIN (NEW FUNCTION) ===
export const sendInviteEmail = async (userId: string) => {
    const response = await apiClient.post('/superadmin/central-admins/send-invite', { userId });
    return response.data;
};