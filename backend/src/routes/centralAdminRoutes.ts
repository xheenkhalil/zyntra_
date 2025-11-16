import { Router } from 'express';
import {
  createCourseAdmin,
  getCourseAdminsForOrg,
  updateCourseAdmin,
  archiveCourseAdmin,
  unarchiveCourseAdmin,
  deleteCourseAdmin,
  sendInviteEmail, 
} from '../controllers/centralAdminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();


router.use(protect, authorize('centraladmin'));

// === Base CRUD Routes ===
router
  .route('/course-admins')
  .post(createCourseAdmin)      
  .get(getCourseAdminsForOrg);

router
  .route('/course-admins/:userId')
  .put(updateCourseAdmin)        
  .delete(deleteCourseAdmin);   

// === Status Management Routes ===
router.put('/course-admins/:userId/archive', archiveCourseAdmin);
router.put('/course-admins/:userId/unarchive', unarchiveCourseAdmin);

// === Invitation Route ===
router.post('/send-invite/:userId', sendInviteEmail);

export default router;
