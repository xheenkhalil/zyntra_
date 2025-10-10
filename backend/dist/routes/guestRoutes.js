"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const guestController_1 = require("../controllers/guestController");
const router = (0, express_1.Router)();
// ================================================================
//  PUBLIC-FACING GUEST QUIZ ROUTES
// ================================================================
// Fetch all published quizzes for the homepage
router.get('/quizzes', guestController_1.getPublicQuizzes);
// Fetch a single quiz by its ID
router.get('/quizzes/:quizId', guestController_1.getPublicQuizById);
// Submit quiz answers and (optionally) a rating
router.post('/quizzes/:quizId/submit', guestController_1.submitPublicQuiz);
// ✅ NEW ENDPOINT: Update rating after submission
router.put('/quizzes/:quizId/rating', guestController_1.updateQuizRating);
exports.default = router;
