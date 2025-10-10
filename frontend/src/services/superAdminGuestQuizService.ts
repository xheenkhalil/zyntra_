// /frontend/src/services/superAdminGuestQuizService.ts

import axios from 'axios';
import { API_BASE_URL } from '../config';

const GUEST_QUIZ_API_URL = `${API_BASE_URL}/api/superadmin/guest-quizzes`;

// Helper interface for quiz data structure expected from backend
export interface GuestQuiz {
    id: string;
    title: string;
    category: string;
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
    const response = await axios.get(GUEST_QUIZ_API_URL, { withCredentials: true });
    return response.data;
};

export const getGuestQuizById = async (quizId: string): Promise<FullGuestQuizDetails> => {
    const response = await axios.get(`${GUEST_QUIZ_API_URL}/${quizId}`, { withCredentials: true });
    return response.data;
};

export const createGuestQuiz = async (title: string, category: string): Promise<GuestQuiz> => {
    // Backend expects { title, category }
    const response = await axios.post(GUEST_QUIZ_API_URL, { title, category }, { withCredentials: true });
    return response.data;
};

// Update quiz metadata (title, category, status)
export const updateGuestQuiz = async (
    quizId: string, 
    data: { title: string; category: string; status: 'draft' | 'published' }
): Promise<GuestQuiz> => {
    const response = await axios.put(`${GUEST_QUIZ_API_URL}/${quizId}`, data, { withCredentials: true });
    return response.data;
};

export const deleteGuestQuiz = async (quizId: string): Promise<{ message: string }> => {
    const response = await axios.delete(`${GUEST_QUIZ_API_URL}/${quizId}`, { withCredentials: true });
    return response.data;
};

// --- API Calls for Guest Quiz Question Management ---
interface AddQuestionPayload {
    question_text: string;
    options: { text: string; isCorrect: boolean }[];
}
export const addGuestQuizQuestion = async (quizId: string, questionData: AddQuestionPayload): Promise<GuestQuestion> => {
    const response = await axios.post(`${GUEST_QUIZ_API_URL}/${quizId}/questions`, questionData, { withCredentials: true });
    return response.data;
};

interface UpdateQuestionPayload {
    quiz_id: string;
    question_text: string;
    options: { text: string; isCorrect: boolean }[];
}
export const updateGuestQuizQuestion = async (questionId: string, questionData: UpdateQuestionPayload): Promise<GuestQuestion> => {

    const response = await axios.put(`${GUEST_QUIZ_API_URL}/questions/${questionId}`, questionData, { withCredentials: true });
    return response.data;
};

export const deleteGuestQuizQuestion = async (questionId: string): Promise<{ message: string }> => {
    const response = await axios.delete(`${GUEST_QUIZ_API_URL}/questions/${questionId}`, { withCredentials: true });
    return response.data;
};