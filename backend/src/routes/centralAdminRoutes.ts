import { Router } from 'express';
import {
  createCourseAdmin,
  getCourseAdminsForOrg,
  updateCourseAdmin,
  archiveCourseAdmin,
  unarchiveCourseAdmin,
  deleteCourseAdmin,
  sendInviteEmail, // ✅ newly added
} from '../controllers/centralAdminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

/**
 * All routes in this file require authentication and central admin privileges.
 * If in the future you add public routes (like password setup), 
 * move them *above* this middleware.
 */
router.use(protect, authorize('centraladmin'));

// === Base CRUD Routes ===
router
  .route('/course-admins')
  .post(createCourseAdmin)       // Create new course admin
  .get(getCourseAdminsForOrg);   // Fetch all course admins for this org

router
  .route('/course-admins/:userId')
  .put(updateCourseAdmin)        // Update course admin details
  .delete(deleteCourseAdmin);    // Permanently delete course admin

// === Status Management Routes ===
router.put('/course-admins/:userId/archive', archiveCourseAdmin);
router.put('/course-admins/:userId/unarchive', unarchiveCourseAdmin);

// === Invitation Route ===
router.post('/send-invite/:userId', sendInviteEmail); // ✅ fixed

export default router;
