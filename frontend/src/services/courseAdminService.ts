// /frontend/src/services/courseAdminService.ts

import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
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

// We will add functions for update, archive, delete later as we complete the module.