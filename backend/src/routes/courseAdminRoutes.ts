// /backend/src/routes/courseAdminRoutes.ts

import { Router } from 'express';
import multer from 'multer';
import { protect, authorize } from '../middleware/authMiddleware';

// --- 1. Import Student Controllers ---
import {
  createStudent,
  getStudentsForOrg,
  bulkRegisterStudents,
  updateStudent,
  deleteStudent,
  exportStudents,
  bulkDeleteStudents,
} from '../controllers/courseAdminController';

// --- 2. Import Dashboard Controllers ---
import { getTeacherDashboardBatch } from '../controllers/courseAdminDashboardController';

// --- 3. Import Exam Controllers ---
import {
  updateExamSettings,
  deleteExam,
  addQuestionToExam,
  getExamResults,
  getExamById,
} from '../controllers/examController';

// Import stubs for missing functions
import {
  updateQuestionInExam as updateQuestionStub,
  archiveExam as archiveStub,
  restoreExam as restoreStub,
} from '../controllers/examController-stubs';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// =====================================================
// SECURITY: Apply to ALL routes in this file
// =====================================================
router.use(protect, authorize('courseadmin'));

// =====================================================
// A. DASHBOARD & ANALYTICS
// =====================================================
// GET /api/courseadmin/dashboard-batch
router.get(
  '/dashboard-batch',
  (req, res, next) => {
    console.log('🔵🔵🔵 ROUTE HIT: /api/courseadmin/dashboard-batch');
    console.log('🔵 User:', (req as any).user);
    next();
  },
  getTeacherDashboardBatch,
);

// =====================================================
// B. STUDENT MANAGEMENT
// =====================================================
// GET /api/courseadmin/students/export
router.get('/students/export', exportStudents);

// GET /api/courseadmin/students
// POST /api/courseadmin/students
router.route('/students').get(getStudentsForOrg).post(createStudent);

// PUT /api/courseadmin/students/:id
// DELETE /api/courseadmin/students/:id
router.route('/students/:id').put(updateStudent).delete(deleteStudent);

// POST /api/courseadmin/students/bulk-delete
router.post('/students/bulk-delete', bulkDeleteStudents);

// POST /api/courseadmin/students/bulk-register
router.post('/students/bulk-register', upload.single('studentsFile'), bulkRegisterStudents);

// =====================================================
// C. EXAM MANAGEMENT
// =====================================================
// NOTE: Basic CRUD (Create/Get All) is usually handled in examRoutes.ts under /api/exams
// These are the specific actions for editing/managing.

// Routes for a specific exam by its ID
router.route('/exams/:examId').get(getExamById).put(updateExamSettings).delete(deleteExam);

// Specific action routes
router.put('/exams/:examId/archive', archiveStub);
router.put('/exams/:examId/restore', restoreStub);

// Question Management
router.post('/exams/:examId/questions', addQuestionToExam);
router.put('/exams/:examId/questions/:questionId', updateQuestionStub);

// Exam Results
router.get('/exams/:examId/results', getExamResults);

export default router;
