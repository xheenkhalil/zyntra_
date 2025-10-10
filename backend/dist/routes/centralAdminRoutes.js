"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const centralAdminController_1 = require("../controllers/centralAdminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/**
 * All routes in this file require authentication and central admin privileges.
 * If in the future you add public routes (like password setup),
 * move them *above* this middleware.
 */
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('centraladmin'));
// === Base CRUD Routes ===
router
    .route('/course-admins')
    .post(centralAdminController_1.createCourseAdmin) // Create new course admin
    .get(centralAdminController_1.getCourseAdminsForOrg); // Fetch all course admins for this org
router
    .route('/course-admins/:userId')
    .put(centralAdminController_1.updateCourseAdmin) // Update course admin details
    .delete(centralAdminController_1.deleteCourseAdmin); // Permanently delete course admin
// === Status Management Routes ===
router.put('/course-admins/:userId/archive', centralAdminController_1.archiveCourseAdmin);
router.put('/course-admins/:userId/unarchive', centralAdminController_1.unarchiveCourseAdmin);
// === Invitation Route ===
router.post('/send-invite/:userId', centralAdminController_1.sendInviteEmail); // ✅ fixed
exports.default = router;
