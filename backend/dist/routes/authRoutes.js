"use strict";
// /backend/src/routes/authRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// 1. Add logoutUser to the import
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post('/login', authController_1.loginUser);
router.get('/me', authController_1.getMe);
router.post('/setup-account', authController_1.setupAccount);
// 2. Add the new logout route. We use POST as a best practice for actions that change state.
router.post('/logout', authController_1.logoutUser);
exports.default = router;
