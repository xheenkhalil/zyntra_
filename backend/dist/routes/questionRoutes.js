"use strict";
// /backend/src/routes/questionRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const examController_stubs_1 = require("../controllers/examController-stubs");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All routes in this file require authentication and courseadmin role
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('courseadmin'));
// DELETE /api/questions/:questionId
// Deletes a single question by its ID
// The examId is provided in the request body for security checking
router.delete('/:questionId', examController_stubs_1.deleteQuestion);
exports.default = router;
