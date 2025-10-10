"use strict";
// /backend/src/routes/analyticsRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// This route is protected for Course Admins
router.get('/course-admin', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('courseadmin'), analyticsController_1.getCourseAdminStats);
exports.default = router;
