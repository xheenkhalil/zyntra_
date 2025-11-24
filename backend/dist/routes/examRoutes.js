"use strict";
// /backend/src/routes/examRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const examController_1 = require("../controllers/examController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All routes in this file are for Course Admins
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('courseadmin'));
// Routes for the main exam collection
router.route('/')
    .post(examController_1.createExam)
    .get(examController_1.getExamsForCourseAdmin);
// Routes for a specific exam by its ID
router.route('/:examId')
    .get(examController_1.getExamById)
    .put(examController_1.updateExamSettings)
    .delete(examController_1.deleteExam);
// Specific action routes for an exam
router.put('/:examId/archive', examController_1.archiveExam);
router.put('/:examId/restore', examController_1.restoreExam);
// ===========================================
// ROUTES FOR QUESTIONS AND RESULTS
// ===========================================
router.post('/:examId/questions', examController_1.addQuestionToExam);
router.put('/:examId/questions/:questionId', examController_1.updateQuestionInExam);
router.get('/:examId/results', examController_1.getExamResults);
exports.default = router;
