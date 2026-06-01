// /backend/src/routes/superAdminRoutes.ts

import { Router } from 'express';
import {
  // Existing Org/Admin functions
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  archiveOrganization,
  unarchiveOrganization,
  deleteOrganization,
  createCentralAdmin,
  sendInviteEmail,

  // Dashboard Analytics functions
  getDashboardStats,
  getUserGrowthChart,
  getSystemPerformanceChart,
  getActivityFeed,

  // --- NEW: Importing User Management functions (Task 5) ---
  getAllUsers,
  updateUserStatus,
  updateUserRole,
} from '../controllers/superAdminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// This middleware protects all routes in this file and ensures only a 'superadmin' can access them
router.use(protect, authorize('superadmin'));

// =====================================
// DASHBOARD ANALYTICS ROUTES (TASK 3)
// =====================================

// GET /api/superadmin/stats
router.get('/stats', getDashboardStats);

// GET /api/superadmin/charts/user-growth
router.get('/charts/user-growth', getUserGrowthChart);

// GET /api/superadmin/charts/performance
router.get('/charts/performance', getSystemPerformanceChart);

// GET /api/superadmin/activity-feed
router.get('/activity-feed', getActivityFeed);

// =====================================
// ORGANIZATION & ADMIN ROUTES (TASK 4)
// =====================================

// Routes for the organization collection
// POST | GET /api/superadmin/organizations
router.route('/organizations').get(getAllOrganizations).post(createOrganization);

// Routes for a specific organization by ID
// PUT | DELETE /api/superadmin/organizations/:id
router.route('/organizations/:id').put(updateOrganization).delete(deleteOrganization);

// Specific action routes for an organization
// PUT /api/superadmin/organizations/:id/archive
router.put('/organizations/:id/archive', archiveOrganization);
// PUT /api/superadmin/organizations/:id/unarchive
router.put('/organizations/:id/unarchive', unarchiveOrganization);

// Route for the Super Admin to create a Central Admin
// POST /api/superadmin/central-admins
router.post('/central-admins', createCentralAdmin);

// Route to send an invite email
// POST /api/superadmin/central-admins/send-invite
router.post('/central-admins/send-invite', sendInviteEmail);

// =====================================
// NEW: USER MANAGEMENT ROUTES (TASK 5)
// =====================================

// GET /api/superadmin/users (with filters as query params)
router.get('/users', getAllUsers);

// PUT /api/superadmin/users/:id/status
router.put('/users/:id/status', updateUserStatus);

// PUT /api/superadmin/users/:id/role
router.put('/users/:id/role', updateUserRole);

export default router;
