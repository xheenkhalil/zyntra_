import axios from 'axios';

// ================================================================
//  CONFIGURE API CLIENT
// ================================================================
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: false,
});

// ================================================================
//  FETCH ALL PUBLIC QUIZZES
// ================================================================
export const getPublicQuizzes = async () => {
    const response = await apiClient.get('public/quizzes');
    return response.data;
};

// ================================================================
//  FETCH SINGLE QUIZ BY ID
// ================================================================
export const getPublicQuizById = async (quizId: string) => {
    const response = await apiClient.get(`public/quizzes/${quizId}`);
    return response.data;
};

// ================================================================
//  SUBMIT QUIZ ANSWERS (and optional rating on submission)
// ================================================================
export const submitPublicQuiz = async (quizId: string, answers: object, rating?: number) => {
    const response = await apiClient.post(`public/quizzes/${quizId}/submit`, { answers, rating });
    return response.data;
};

// ================================================================
//  🆕 STEP 3: UPDATE QUIZ RATING (After submission)
// ================================================================
export const updateQuizRating = async (quizId: string, rating: number) => {
    const response = await apiClient.put(`public/quizzes/${quizId}/rating`, { rating });
    return response.data;
};
