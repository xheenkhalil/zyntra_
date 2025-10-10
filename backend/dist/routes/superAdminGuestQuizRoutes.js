"use strict";
// /backend/src/routes/superAdminGuestQuizRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const superAdminGuestQuizController_1 = require("../controllers/superAdminGuestQuizController");
const router = (0, express_1.Router)();
const superAdminAccess = [authMiddleware_1.protect, (0, authMiddleware_1.authorize)('superadmin')];
// --- Guest Quiz Management ---
router.post('/', superAdminAccess, superAdminGuestQuizController_1.createGuestQuiz);
router.get('/', superAdminAccess, superAdminGuestQuizController_1.getAllGuestQuizzes);
router.get('/:quizId', superAdminAccess, superAdminGuestQuizController_1.getGuestQuizById);
router.put('/:quizId', superAdminAccess, superAdminGuestQuizController_1.updateGuestQuiz);
router.delete('/:quizId', superAdminAccess, superAdminGuestQuizController_1.deleteGuestQuiz);
// --- Guest Quiz Question Management ---
router.post('/:quizId/questions', superAdminAccess, superAdminGuestQuizController_1.addGuestQuizQuestion);
router.put('/questions/:questionId', superAdminAccess, superAdminGuestQuizController_1.updateGuestQuizQuestion);
router.delete('/questions/:questionId', superAdminAccess, superAdminGuestQuizController_1.deleteGuestQuizQuestion);
exports.default = router;
