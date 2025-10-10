// /backend/src/routes/analyticsRoutes.ts

import { Router } from 'express';
import { getCourseAdminStats } from '../controllers/analyticsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// This route is protected for Course Admins
router.get('/course-admin', protect, authorize('courseadmin'), getCourseAdminStats);

export default router;