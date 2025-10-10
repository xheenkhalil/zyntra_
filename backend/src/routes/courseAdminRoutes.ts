// /backend/src/routes/courseAdminRoutes.ts

import { Router } from 'express';
import { createStudent, getStudentsForOrg } from '../controllers/courseAdminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Apply middleware to all routes in this file
// User must be logged in, and their role must be 'courseadmin'
router.use(protect, authorize('courseadmin'));

// Route definitions
router.post('/students', createStudent);
router.get('/students', getStudentsForOrg);

export default router;