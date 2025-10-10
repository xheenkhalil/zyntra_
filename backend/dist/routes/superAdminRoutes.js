"use strict";
// /backend/src/routes/superAdminRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superAdminController_1 = require("../controllers/superAdminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// This middleware protects all routes in this file and ensures only a 'superadmin' can access them
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('superadmin'));
// Routes for the organization collection
router.route('/organizations')
    .get(superAdminController_1.getAllOrganizations)
    .post(superAdminController_1.createOrganization);
// Routes for a specific organization by ID
router.route('/organizations/:id')
    .put(superAdminController_1.updateOrganization)
    .delete(superAdminController_1.deleteOrganization);
// Specific action routes for an organization
router.put('/organizations/:id/archive', superAdminController_1.archiveOrganization);
router.put('/organizations/:id/unarchive', superAdminController_1.unarchiveOrganization);
// Route for the Super Admin to create a Central Admin
router.post('/central-admins', superAdminController_1.createCentralAdmin);
// Route to send an invite email
router.post('/central-admins/send-invite', superAdminController_1.sendInviteEmail);
exports.default = router;
