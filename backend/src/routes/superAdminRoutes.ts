// /backend/src/routes/superAdminRoutes.ts

import { Router } from 'express';
import { 
    getAllOrganizations, 
    createOrganization, 
    updateOrganization, 
    archiveOrganization,
    unarchiveOrganization,
    deleteOrganization,
    createCentralAdmin,
    sendInviteEmail 
} from '../controllers/superAdminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// This middleware protects all routes in this file and ensures only a 'superadmin' can access them
router.use(protect, authorize('superadmin'));

// Routes for the organization collection
router.route('/organizations')
    .get(getAllOrganizations)
    .post(createOrganization);

// Routes for a specific organization by ID
router.route('/organizations/:id')
    .put(updateOrganization)
    .delete(deleteOrganization);

// Specific action routes for an organization
router.put('/organizations/:id/archive', archiveOrganization);
router.put('/organizations/:id/unarchive', unarchiveOrganization);

// Route for the Super Admin to create a Central Admin
router.post('/central-admins', createCentralAdmin);

// Route to send an invite email
router.post('/central-admins/send-invite', sendInviteEmail);

export default router;