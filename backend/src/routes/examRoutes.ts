// /backend/src/routes/examRoutes.ts

import { Router } from 'express';
import { 
    createExam, 
    getExamsForCourseAdmin, 
    addQuestionToExam, 
    getExamById, 
    updateExamSettings,
    archiveExam,
    deleteExam,
    restoreExam,
    getExamResults // 1. Import our new function
} from '../controllers/examController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// All routes in this file are for Course Admins
router.use(protect, authorize('courseadmin'));

// Routes for the main exam collection
router.route('/')
    .post(createExam)
    .get(getExamsForCourseAdmin);

// Routes for a specific exam by its ID
router.route('/:examId')
    .get(getExamById)
    .put(updateExamSettings)
    .delete(deleteExam);

// Specific action routes for an exam
router.put('/:examId/archive', archiveExam);
router.put('/:examId/restore', restoreExam);

// Routes for an exam's sub-resources (like questions and results)
router.post('/:examId/questions', addQuestionToExam);
router.get('/:examId/results', getExamResults); // 2. Add the new route here

export default router;