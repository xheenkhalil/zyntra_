"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const proctoringController_1 = require("../controllers/proctoringController");
const router = (0, express_1.Router)();
// =====================================
// STUDENT ROUTES
// =====================================
// GET /api/proctoring/status
// Checks if the student is enrolled
router.get('/status', authMiddleware_1.protect, proctoringController_1.getProctoringStatus);
// POST /api/proctoring/enroll-identity
// Called before the exam to register face data
router.post('/enroll-identity', authMiddleware_1.protect, proctoringController_1.enrollIdentity);
// POST /api/proctoring/analyze-image
// Called every ~10 mins during exam for identity verification
router.post('/analyze-image', authMiddleware_1.protect, proctoringController_1.analyzeTestImage);
// PUT /api/proctoring/register-violation
// Called by frontend listeners when tab switching/behavior occurs
router.put('/register-violation', authMiddleware_1.protect, proctoringController_1.registerViolation);
// =====================================
// TEACHER / ADMIN ROUTES
// =====================================
// GET /api/proctoring/organization-overview
// Called by the Course Admin to see a list of their exams for proctoring
router.get('/organization-overview', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('courseadmin', 'superadmin'), proctoringController_1.getOrganizationProctoringOverview);
// GET /api/proctoring/dashboard-batch/:examId
// Called by the Proctoring Dashboard to get the live feed
router.get('/dashboard-batch/:examId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('courseadmin', 'superadmin'), // Only admins can view the dashboard
proctoringController_1.getExamProctoringBatch);
exports.default = router;
