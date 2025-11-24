"use strict";
// /backend/src/routes/courseAdminRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = require("../middleware/authMiddleware");
// --- 1. Import Student Controllers ---
const courseAdminController_1 = require("../controllers/courseAdminController");
// --- 2. Import Dashboard Controllers ---
const courseAdminDashboardController_1 = require("../controllers/courseAdminDashboardController");
// --- 3. Import Exam Controllers ---
const examController_1 = require("../controllers/examController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// =====================================================
// SECURITY: Apply to ALL routes in this file
// =====================================================
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('courseadmin'));
// =====================================================
// A. DASHBOARD & ANALYTICS
// =====================================================
// GET /api/courseadmin/dashboard-batch
router.get('/dashboard-batch', (req, res, next) => {
    console.log('🔵🔵🔵 ROUTE HIT: /api/courseadmin/dashboard-batch');
    console.log('🔵 User:', req.user);
    next();
}, courseAdminDashboardController_1.getTeacherDashboardBatch);
// =====================================================
// B. STUDENT MANAGEMENT
// =====================================================
// GET /api/courseadmin/students/export
router.get('/students/export', courseAdminController_1.exportStudents);
// GET /api/courseadmin/students
// POST /api/courseadmin/students
router.route('/students')
    .get(courseAdminController_1.getStudentsForOrg)
    .post(courseAdminController_1.createStudent);
// PUT /api/courseadmin/students/:id
// DELETE /api/courseadmin/students/:id
router.route('/students/:id')
    .put(courseAdminController_1.updateStudent)
    .delete(courseAdminController_1.deleteStudent);
// POST /api/courseadmin/students/bulk-delete
router.post('/students/bulk-delete', courseAdminController_1.bulkDeleteStudents);
// POST /api/courseadmin/students/bulk-register
router.post('/students/bulk-register', upload.single('studentsFile'), courseAdminController_1.bulkRegisterStudents);
// =====================================================
// C. EXAM MANAGEMENT
// =====================================================
// NOTE: Basic CRUD (Create/Get All) is usually handled in examRoutes.ts under /api/exams
// These are the specific actions for editing/managing.
// Routes for a specific exam by its ID
router.route('/exams/:examId')
    .get(examController_1.getExamById)
    .put(examController_1.updateExamSettings)
    .delete(examController_1.deleteExam);
// Specific action routes
router.put('/exams/:examId/archive', examController_1.archiveExam);
router.put('/exams/:examId/restore', examController_1.restoreExam);
// Question Management
router.post('/exams/:examId/questions', examController_1.addQuestionToExam);
router.put('/exams/:examId/questions/:questionId', examController_1.updateQuestionInExam);
// Exam Results
router.get('/exams/:examId/results', examController_1.getExamResults);
exports.default = router;
