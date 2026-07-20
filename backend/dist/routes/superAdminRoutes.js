"use strict";
// /backend/src/routes/superAdminRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superAdminController_1 = require("../controllers/superAdminController");
const aiController_1 = require("../controllers/aiController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// This middleware protects all routes in this file and ensures only a 'superadmin' can access them
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('superadmin'));
// =====================================
// DASHBOARD ANALYTICS ROUTES (TASK 3)
// =====================================
// GET /api/superadmin/stats
router.get('/stats', superAdminController_1.getDashboardStats);
// GET /api/superadmin/charts/user-growth
router.get('/charts/user-growth', superAdminController_1.getUserGrowthChart);
// GET /api/superadmin/charts/performance
router.get('/charts/performance', superAdminController_1.getSystemPerformanceChart);
// GET /api/superadmin/activity-feed
router.get('/activity-feed', superAdminController_1.getActivityFeed);
// =====================================
// ORGANIZATION & ADMIN ROUTES (TASK 4)
// =====================================
// Routes for the organization collection
// POST | GET /api/superadmin/organizations
router.route('/organizations').get(superAdminController_1.getAllOrganizations).post(superAdminController_1.createOrganization);
// Routes for a specific organization by ID
// PUT | DELETE /api/superadmin/organizations/:id
router.route('/organizations/:id').put(superAdminController_1.updateOrganization).delete(superAdminController_1.deleteOrganization);
// Specific action routes for an organization
// PUT /api/superadmin/organizations/:id/archive
router.put('/organizations/:id/archive', superAdminController_1.archiveOrganization);
// PUT /api/superadmin/organizations/:id/unarchive
router.put('/organizations/:id/unarchive', superAdminController_1.unarchiveOrganization);
// Route for the Super Admin to create a Central Admin
// POST /api/superadmin/central-admins
router.post('/central-admins', superAdminController_1.createCentralAdmin);
// Route to send an invite email
// POST /api/superadmin/central-admins/send-invite
router.post('/central-admins/send-invite', superAdminController_1.sendInviteEmail);
// =====================================
// NEW: USER MANAGEMENT ROUTES (TASK 5)
// =====================================
// GET /api/superadmin/users (with filters as query params)
router.get('/users', superAdminController_1.getAllUsers);
// PUT /api/superadmin/users/:id/status
router.put('/users/:id/status', superAdminController_1.updateUserStatus);
// POST /api/superadmin/users/:userId/role
router.put('/users/:userId/role', superAdminController_1.updateUserRole);
// =====================================
// AI GENERATION ROUTES
// =====================================
// POST /api/superadmin/ai/guest-quiz-questions
router.post('/ai/guest-quiz-questions', aiController_1.generateGuestQuizQuestions);
// POST /api/superadmin/ai/certification-assessment
router.post('/ai/certification-assessment', aiController_1.generateCertificationAssessment);
exports.default = router;
