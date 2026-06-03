"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const centralAdminController_1 = require("../controllers/centralAdminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('centraladmin'));
// === Base CRUD Routes ===
router.route('/course-admins').post(centralAdminController_1.createCourseAdmin).get(centralAdminController_1.getCourseAdminsForOrg);
router.route('/course-admins/:userId').put(centralAdminController_1.updateCourseAdmin).delete(centralAdminController_1.deleteCourseAdmin);
// === Status Management Routes ===
router.put('/course-admins/:userId/archive', centralAdminController_1.archiveCourseAdmin);
router.put('/course-admins/:userId/unarchive', centralAdminController_1.unarchiveCourseAdmin);
// === Invitation Route ===
router.post('/send-invite/:userId', centralAdminController_1.sendInviteEmail);
// === NEW: Organization Data Routes ===
router.get('/stats', centralAdminController_1.getOrganizationStats);
router.get('/logs', centralAdminController_1.getOrganizationLogs);
router.get('/exams', centralAdminController_1.getOrganizationExams);
router.get('/users', centralAdminController_1.getOrganizationUsers);
exports.default = router;
