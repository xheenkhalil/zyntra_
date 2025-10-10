"use strict";
// /backend/src/routes/studentRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All routes here are for logged-in students
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('student'));
// Gets the list of exams for the dashboard
router.get('/exams', studentController_1.getAvailableExams);
// Starts or Resumes a specific exam
router.post('/exams/:examId/start', studentController_1.startOrResumeExam);
// Periodically saves the progress of an in-progress submission
router.put('/submissions/:submissionId/progress', studentController_1.saveExamProgress);
// Submits the exam for final grading
router.post('/submissions/:submissionId/submit', studentController_1.submitExam);
exports.default = router;
