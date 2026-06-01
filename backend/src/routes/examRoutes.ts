// /backend/src/routes/examRoutes.ts

import { Router } from 'express';
import {
  createExam,
  getExamsForCourseAdmin,
  addQuestionToExam,
  getExamById,
  updateExamSettings,
  deleteExam,
  getExamResults,
} from '../controllers/examController';
import {
  archiveExam,
  restoreExam,
  updateQuestionInExam,
} from '../controllers/examController-stubs';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// All routes in this file are for Course Admins
router.use(protect, authorize('courseadmin'));

// Routes for the main exam collection
router.route('/').post(createExam).get(getExamsForCourseAdmin);

// Routes for a specific exam by its ID
router.route('/:examId').get(getExamById).put(updateExamSettings).delete(deleteExam);

// Specific action routes for an exam
router.put('/:examId/archive', archiveExam);
router.put('/:examId/restore', restoreExam);

// Routes for an exam's sub-resources (like questions and results)
router.post('/:examId/questions', addQuestionToExam);
router.put('/:examId/questions/:questionId', updateQuestionInExam);
router.get('/:examId/results', getExamResults);

export default router;
