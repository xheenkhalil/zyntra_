import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    enrollIdentity,
    analyzeTestImage,
    registerViolation,
    getExamProctoringBatch,
    getOrganizationProctoringOverview,
    getProctoringStatus
} from '../controllers/proctoringController';

const router = Router();

// =====================================
// STUDENT ROUTES
// =====================================

// GET /api/proctoring/status
// Checks if the student is enrolled
router.get(
    '/status',
    protect,
    getProctoringStatus
);

// POST /api/proctoring/enroll-identity
// Called before the exam to register face data
router.post(
    '/enroll-identity',
    protect,
    enrollIdentity
);

// POST /api/proctoring/analyze-image
// Called every ~10 mins during exam for identity verification
router.post(
    '/analyze-image',
    protect,
    analyzeTestImage
);

// PUT /api/proctoring/register-violation
// Called by frontend listeners when tab switching/behavior occurs
router.put(
    '/register-violation',
    protect,
    registerViolation
);


// =====================================
// TEACHER / ADMIN ROUTES
// =====================================

// GET /api/proctoring/organization-overview
// Called by the Course Admin to see a list of their exams for proctoring
router.get(
    '/organization-overview',
    protect,
    authorize('courseadmin', 'superadmin'),
    getOrganizationProctoringOverview
);

// GET /api/proctoring/dashboard-batch/:examId
// Called by the Proctoring Dashboard to get the live feed
router.get(
    '/dashboard-batch/:examId',
    protect,
    authorize('courseadmin', 'superadmin'), // Only admins can view the dashboard
    getExamProctoringBatch
);

export default router;