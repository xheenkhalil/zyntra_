// /frontend/src/services/courseAdminService.ts

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // <--- USE ENVIRONMENT VARIABLE
  withCredentials: true,
});

export interface CreateStudentData {
    fullName: string;
    email: string;
}

export const getStudents = async () => {
    const response = await apiClient.get('/courseadmin/students');
    return response.data;
};

export const createStudent = async (data: CreateStudentData) => {
    const response = await apiClient.post('/courseadmin/students', data);
    return response.data;
};
