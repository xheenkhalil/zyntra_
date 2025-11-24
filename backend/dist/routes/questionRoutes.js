"use strict";
// /backend/src/routes/questionRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// --- FIX: Import the new, secure update and delete functions from examController ---
const examController_1 = require("../controllers/examController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All question actions are for Course Admins
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('courseadmin'));
// Routes for a specific question ID
// PUT /api/questions/:questionId
// FIX: updateQuestion is replaced by updateQuestionInExam
router.put('/:questionId', examController_1.updateQuestionInExam);
// DELETE /api/questions/:questionId
// FIX: deleteQuestion logic now points to the secure function in examController (assuming it's a generic delete now)
router.delete('/:questionId', examController_1.deleteQuestion);
exports.default = router;
