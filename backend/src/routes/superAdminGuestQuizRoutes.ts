// /backend/src/routes/superAdminGuestQuizRoutes.ts

import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware'; 
import { 
    createGuestQuiz, 
    getAllGuestQuizzes, 
    getGuestQuizById, 
    updateGuestQuiz, 
    deleteGuestQuiz,
    addGuestQuizQuestion,
    updateGuestQuizQuestion,
    deleteGuestQuizQuestion
} from '../controllers/superAdminGuestQuizController';

const router = Router();
const superAdminAccess = [protect, authorize('superadmin')];

// --- Guest Quiz Management ---
router.post('/', superAdminAccess, createGuestQuiz);
router.get('/', superAdminAccess, getAllGuestQuizzes);
router.get('/:quizId', superAdminAccess, getGuestQuizById);
router.put('/:quizId', superAdminAccess, updateGuestQuiz);
router.delete('/:quizId', superAdminAccess, deleteGuestQuiz);

// --- Guest Quiz Question Management ---
router.post('/:quizId/questions', superAdminAccess, addGuestQuizQuestion);
router.put('/questions/:questionId', superAdminAccess, updateGuestQuizQuestion); 
router.delete('/questions/:questionId', superAdminAccess, deleteGuestQuizQuestion);

export default router;