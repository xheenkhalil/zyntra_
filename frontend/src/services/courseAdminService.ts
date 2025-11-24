import axios from 'axios';

// ---------------------------------------------------------
// API Client Setup
// ---------------------------------------------------------
// Robustly handle VITE_BACKEND_URL whether it includes /api or not
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ===========================================
// DASHBOARD BATCH ENDPOINT
// ===========================================
export const getTeacherDashboardBatch = async (examId?: string) => {
  const params = examId && examId !== 'all' ? { examId } : {};
  const response = await apiClient.get('/courseadmin/dashboard-batch', { params });
  return response.data;
};

// ===========================================
// STUDENT MANAGEMENT
// ===========================================
export const getStudents = async (page: number = 1, limit: number = 10) => {
  const response = await apiClient.get('/courseadmin/students', {
    params: { page, limit }
  });
  return response.data;
};

export const createStudent = async (studentData: any) => {
  const response = await apiClient.post('/courseadmin/students', studentData);
  return response.data;
};

export const bulkUploadStudents = async (file: File, sendEmails: boolean = false) => {
  const formData = new FormData();
  formData.append('studentsFile', file);
  formData.append('sendEmails', String(sendEmails));

  const response = await apiClient.post('/courseadmin/students/bulk-register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateStudent = async (id: string, data: any) => {
  const response = await apiClient.put(`/courseadmin/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id: string) => {
  const response = await apiClient.delete(`/courseadmin/students/${id}`);
  return response.data;
};

export const bulkDeleteStudents = async (studentIds: string[]) => {
  const response = await apiClient.post('/courseadmin/students/bulk-delete', { studentIds });
  return response.data;
};

export const exportStudents = async () => {
  const response = await apiClient.get('/courseadmin/students/export', {
    responseType: 'blob', // Important for file download
  });
  return response.data;
};

// ===========================================
// EXAM MANAGEMENT (NEWLY ADDED)
// ===========================================

// 1. Get Exam by ID
export const getExamById = async (examId: string) => {
  const response = await apiClient.get(`/courseadmin/exams/${examId}`);
  return response.data;
};

// 2. Update Exam Settings
export const updateExamSettings = async (examId: string, data: any) => {
  const response = await apiClient.put(`/courseadmin/exams/${examId}`, data);
  return response.data;
};

// 3. Add Question
export const addQuestionToExam = async (examId: string, data: any) => {
  const response = await apiClient.post(`/courseadmin/exams/${examId}/questions`, data);
  return response.data;
};

// 4. Update Question
export const updateQuestionInExam = async (examId: string, questionId: string, data: any) => {
  const response = await apiClient.put(`/courseadmin/exams/${examId}/questions/${questionId}`, data);
  return response.data;
};

// 5. Delete Question
export const deleteQuestion = async (examId: string, questionId: string) => {
  // Note: Our backend route structure might just need questionId, but putting it under exams context is safer REST practice
  const response = await apiClient.delete(`/courseadmin/exams/${examId}/questions/${questionId}`);
  return response.data;
};