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

// ---------------------------------------------------------
// Exams CRUD Operations
// ---------------------------------------------------------
export const getExams = async () => {
  const response = await apiClient.get('/exams');
  return response.data;
};

export const createExam = async (title: string) => {
  const response = await apiClient.post('/exams', { title });
  return response.data;
};

export const getExamById = async (examId: string) => {
  const response = await apiClient.get(`/exams/${examId}`);
  return response.data;
};

// ---------------------------------------------------------
// Questions Management
// ---------------------------------------------------------
export const addQuestionToExam = async (examId: string, questionData: object) => {
  const response = await apiClient.post(`/exams/${examId}/questions`, questionData);
  return response.data;
};

export const updateQuestion = async (questionId: string, questionData: object) => {
  const response = await apiClient.put(`/questions/${questionId}`, questionData);
  return response.data;
};

export const deleteQuestion = async (questionId: string) => {
  const response = await apiClient.delete(`/questions/${questionId}`);
  return response.data;
};

// ---------------------------------------------------------
// AI Question Generation
// ---------------------------------------------------------
export const generateAiQuestions = async (data: object) => {
  const response = await apiClient.post('/ai/generate-questions', data);
  return response.data;
};

export const generateFromDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('document', file);
  const response = await apiClient.post('/ai/generate-from-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ---------------------------------------------------------
// UPDATED: Smarter Update Exam Settings
// ---------------------------------------------------------
export const updateExamSettings = async (
  examId: string,
  settings: {
    status?: string;
    grading_scale?: object;
    duration_minutes?: number;
    instructions?: string;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
  const response = await apiClient.put(`/exams/${examId}`, settings);
  return response.data;
};

// ---------------------------------------------------------
// Archive, Delete, and Restore Exams
// ---------------------------------------------------------
export const archiveExam = async (examId: string) => {
  const response = await apiClient.put(`/exams/${examId}/archive`);
  return response.data;
};

export const deleteExam = async (examId: string) => {
  const response = await apiClient.delete(`/exams/${examId}`);
  return response.data;
};

export const restoreExam = async (examId: string) => {
  const response = await apiClient.put(`/exams/${examId}/restore`);
  return response.data;
};

export const getExamResults = async (examId: string) => {
  const response = await apiClient.get(`/exams/${examId}/results`);
  return response.data;
};
