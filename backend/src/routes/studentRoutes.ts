// /backend/src/routes/studentRoutes.ts

import { Router } from 'express';
import {
    getAvailableExams,
    getExamInfo,
    startOrResumeExam,
    saveExamProgress,
    submitExam
} from '../controllers/studentController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// All routes here are for logged-in students
router.use(protect, authorize('student'));

// Gets the list of exams for the dashboard
router.get('/exams', getAvailableExams);

// Gets public info about an exam (instructions, etc.)
router.get('/exams/:examId/info', getExamInfo);

// Starts or Resumes a specific exam
router.post('/exams/:examId/start', startOrResumeExam);

// Periodically saves the progress of an in-progress submission
router.put('/submissions/:submissionId/progress', saveExamProgress);

// Submits the exam for final grading
router.post('/submissions/:submissionId/submit', submitExam);

export default router;