// /backend/src/routes/questionRoutes.ts

import { Router } from 'express';
import { updateQuestion, deleteQuestion } from '../controllers/questionController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// All question actions are for Course Admins
router.use(protect, authorize('courseadmin'));

router.route('/:questionId')
    .put(updateQuestion)
    .delete(deleteQuestion);

export default router;