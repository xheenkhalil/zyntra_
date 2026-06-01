// backend/src/routes/systemRoutes.ts

import { Router } from 'express';
import { getSystemStatus } from '../controllers/systemController';

// Import your existing middleware
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

/**
 * GET /api/system/status
 *
 * @description Get a full health-check report of all system services.
 * @access Private - Superadmin Only
 */
router.get(
  '/status',
  protect, // 1. Checks for a valid login token
  authorize('superadmin'), // 2. Checks if the user's role is 'superadmin'
  getSystemStatus, // 3. Only runs if both checks pass
);

export default router;
