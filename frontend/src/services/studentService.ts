// /frontend/src/services/studentService.ts

import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
});

export const getAvailableExams = async () => {
    const response = await apiClient.get('/student/exams');
    return response.data;
};

export const startOrResumeExam = async (examId: string) => {
    const response = await apiClient.post(`/student/exams/${examId}/start`);
    return response.data;
};

// --- THIS IS THE NEWLY ADDED FUNCTION ---
export const saveExamProgress = async (submissionId: string, data: { answers: object; time_remaining_seconds: number }) => {
    const response = await apiClient.put(`/student/submissions/${submissionId}/progress`, data);
    return response.data;
};

export const submitExam = async (submissionId: string, answers: object) => {
    const response = await apiClient.post(`/student/submissions/${submissionId}/submit`, { answers });
    return response.data;
};