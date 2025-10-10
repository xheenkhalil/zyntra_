"use strict";
// /backend/src/routes/courseAdminRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courseAdminController_1 = require("../controllers/courseAdminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Apply middleware to all routes in this file
// User must be logged in, and their role must be 'courseadmin'
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('courseadmin'));
// Route definitions
router.post('/students', courseAdminController_1.createStudent);
router.get('/students', courseAdminController_1.getStudentsForOrg);
exports.default = router;
