"use strict";
// /backend/src/routes/authRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// --- Public Routes (No auth required) ---
router.post('/login', authController_1.loginUser);
router.post('/setup-account', authController_1.setupAccount);
router.post('/logout', authController_1.logoutUser);
// --- Protected Routes (Auth required) ---
router.get('/me', authMiddleware_1.protect, authController_1.getMe);
router.put('/profile', authMiddleware_1.protect, authController_1.updateMyProfile);
router.put('/change-password', authMiddleware_1.protect, authController_1.changeMyPassword);
exports.default = router;
