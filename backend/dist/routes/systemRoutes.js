"use strict";
// backend/src/routes/systemRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const systemController_1 = require("../controllers/systemController");
// Import your existing middleware
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/**
 * GET /api/system/status
 *
 * @description Get a full health-check report of all system services.
 * @access Private - Superadmin Only
 */
router.get('/status', authMiddleware_1.protect, // 1. Checks for a valid login token
(0, authMiddleware_1.authorize)('superadmin'), // 2. Checks if the user's role is 'superadmin'
systemController_1.getSystemStatus);
exports.default = router;
