"use strict";
// /backend/src/routes/superAdminGuestQuizRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const superAdminGuestQuizController_1 = require("../controllers/superAdminGuestQuizController");
const router = (0, express_1.Router)();
// --- UPGRADE ---
// This middleware protects all routes in this file and ensures only a 'superadmin' can access them.
// This is much cleaner than adding 'superAdminAccess' to every route.
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('superadmin'));
// --- Guest Quiz Management (Upgraded with router.route()) ---
router.route('/')
    .post(superAdminGuestQuizController_1.createGuestQuiz)
    .get(superAdminGuestQuizController_1.getAllGuestQuizzes);
router.route('/:quizId')
    .get(superAdminGuestQuizController_1.getGuestQuizById)
    .put(superAdminGuestQuizController_1.updateGuestQuiz)
    .delete(superAdminGuestQuizController_1.deleteGuestQuiz);
// --- Guest Quiz Question Management ---
// POST /api/guest-quizzes/:quizId/questions
router.post('/:quizId/questions', superAdminGuestQuizController_1.addGuestQuizQuestion);
// PUT /api/guest-quizzes/questions/:questionId
router.put('/questions/:questionId', superAdminGuestQuizController_1.updateGuestQuizQuestion);
// DELETE /api/guest-quizzes/questions/:questionId
router.delete('/questions/:questionId', superAdminGuestQuizController_1.deleteGuestQuizQuestion);
exports.default = router;
