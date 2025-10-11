// /frontend/src/services/superAdminService.ts

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // <--- USE ENVIRONMENT VARIABLE
  withCredentials: true,
});

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