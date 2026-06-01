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
  deleteGuestQuizQuestion,
} from '../controllers/superAdminGuestQuizController';

const router = Router();

// --- UPGRADE ---
// This middleware protects all routes in this file and ensures only a 'superadmin' can access them.
// This is much cleaner than adding 'superAdminAccess' to every route.
router.use(protect, authorize('superadmin'));

// --- Guest Quiz Management (Upgraded with router.route()) ---
router.route('/').post(createGuestQuiz).get(getAllGuestQuizzes);

router.route('/:quizId').get(getGuestQuizById).put(updateGuestQuiz).delete(deleteGuestQuiz);

// --- Guest Quiz Question Management ---
// POST /api/guest-quizzes/:quizId/questions
router.post('/:quizId/questions', addGuestQuizQuestion);

// PUT /api/guest-quizzes/questions/:questionId
router.put('/questions/:questionId', updateGuestQuizQuestion);

// DELETE /api/guest-quizzes/questions/:questionId
router.delete('/questions/:questionId', deleteGuestQuizQuestion);

export default router;
