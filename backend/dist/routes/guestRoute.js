"use strict";
// /backend/src/routes/guestRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const guestController_1 = require("../controllers/guestController");
const router = (0, express_1.Router)();
// These are all public-facing routes
router.get('/quizzes', guestController_1.getPublicQuizzes);
router.get('/quizzes/:quizId', guestController_1.getPublicQuizById);
router.post('/quizzes/:quizId/submit', guestController_1.submitPublicQuiz);
exports.default = router;
