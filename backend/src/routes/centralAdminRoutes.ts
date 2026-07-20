import { Router } from 'express';
import multer from 'multer';
import {
  createCourseAdmin,
  getCourseAdminsForOrg,
  updateCourseAdmin,
  archiveCourseAdmin,
  unarchiveCourseAdmin,
  deleteCourseAdmin,
  sendInviteEmail,
  getOrganizationStats,
  getOrganizationLogs,
  getOrganizationExams,
  getOrganizationUsers,
  bulkCreateCourseAdmins,
} from '../controllers/centralAdminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect, authorize('centraladmin'));

// === Base CRUD Routes ===
router.route('/course-admins').post(createCourseAdmin).get(getCourseAdminsForOrg);
router.post('/course-admins/bulk-register', upload.single('file'), bulkCreateCourseAdmins);

router.route('/course-admins/:userId').put(updateCourseAdmin).delete(deleteCourseAdmin);

// === Status Management Routes ===
router.put('/course-admins/:userId/archive', archiveCourseAdmin);
router.put('/course-admins/:userId/unarchive', unarchiveCourseAdmin);

// === Invitation Route ===
router.post('/send-invite/:userId', sendInviteEmail);

// === NEW: Organization Data Routes ===
router.get('/stats', getOrganizationStats);
router.get('/logs', getOrganizationLogs);
router.get('/exams', getOrganizationExams);
router.get('/users', getOrganizationUsers);

export default router;
