// /backend/src/routes/questionRoutes.ts

import { Router } from 'express';
import { deleteQuestion } from '../controllers/examController-stubs';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// All routes in this file require authentication and courseadmin role
router.use(protect, authorize('courseadmin'));

// DELETE /api/questions/:questionId
// Deletes a single question by its ID
// The examId is provided in the request body for security checking
router.delete('/:questionId', deleteQuestion);

export default router;
