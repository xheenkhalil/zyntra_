import { Router } from 'express';
import { 
    getPublicQuizzes, 
    getPublicQuizById, 
    submitPublicQuiz, 
    updateQuizRating // ✅ newly added controller import
} from '../controllers/guestController';

const router = Router();

// ================================================================
//  PUBLIC-FACING GUEST QUIZ ROUTES
// ================================================================

// Fetch all published quizzes for the homepage
router.get('/quizzes', getPublicQuizzes);

// Fetch a single quiz by its ID
router.get('/quizzes/:quizId', getPublicQuizById);

// Submit quiz answers and (optionally) a rating
router.post('/quizzes/:quizId/submit', submitPublicQuiz);

// ✅ NEW ENDPOINT: Update rating after submission
router.put('/quizzes/:quizId/rating', updateQuizRating);

export default router;
