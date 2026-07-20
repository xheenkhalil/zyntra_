// /frontend/src/services/superAdminGuestQuizService.ts

import axios from 'axios';

// Use the same environment variable as other services
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

// Helper interface for quiz data structure expected from backend
export interface GuestQuiz {
    id: string;
    title: string;
    category: string;
    image_url?: string;
    status: 'draft' | 'published';
    participant_count: number;
    average_rating: number | null;
    updated_at: string;
}

// Helper interface for question data structure
export interface GuestQuestion {
    id: string;
    quiz_id: string;
    question_text: string;
    options: { text: string; isCorrect: boolean }[];
    created_at: string;
    updated_at: string;
}

// Full Quiz details for editing (includes questions and correct answers)
export interface FullGuestQuizDetails extends GuestQuiz {
    questions: GuestQuestion[];
}

// --- API Calls for Guest Quiz Management ---

export const getAllGuestQuizzes = async (): Promise<GuestQuiz[]> => {
    const response = await apiClient.get('/superadmin/guest-quizzes');
    return response.data;
};

export const getGuestQuizById = async (quizId: string): Promise<FullGuestQuizDetails> => {
    const response = await apiClient.get(`/superadmin/guest-quizzes/${quizId}`);
    return response.data;
};

export const createGuestQuiz = async (title: string, category: string, image_url?: string): Promise<GuestQuiz> => {
    const response = await apiClient.post('/superadmin/guest-quizzes', { title, category, image_url });
    return response.data;
};

export const updateGuestQuiz = async (id: string, updates: Partial<{ title: string; category: string; image_url: string; status: 'draft' | 'published' }>): Promise<GuestQuiz> => {
    const response = await apiClient.put(`/superadmin/guest-quizzes/${id}`, updates);
    return response.data;
};

export const deleteGuestQuiz = async (quizId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/superadmin/guest-quizzes/${quizId}`);
    return response.data;
};

// --- API Calls for Guest Quiz Question Management ---
interface AddQuestionPayload {
    question_text: string;
    options: { text: string; isCorrect: boolean }[];
}
export const addGuestQuizQuestion = async (quizId: string, questionData: AddQuestionPayload): Promise<GuestQuestion> => {
    const response = await apiClient.post(`/superadmin/guest-quizzes/${quizId}/questions`, questionData);
    return response.data;
};
// Update question text and options
interface UpdateQuestionPayload {
    quiz_id: string;
    question_text: string;
    options: { text: string; isCorrect: boolean }[];
}
export const updateGuestQuizQuestion = async (questionId: string, questionData: UpdateQuestionPayload): Promise<GuestQuestion> => {

    const response = await apiClient.put(`/superadmin/guest-quizzes/questions/${questionId}`, questionData);
    return response.data;
};

export const deleteGuestQuizQuestion = async (questionId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/superadmin/guest-quizzes/questions/${questionId}`);
    return response.data;
};