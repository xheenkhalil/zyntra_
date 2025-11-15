// /backend/src/routes/authRoutes.ts

import { Router } from 'express';
import {
    loginUser,
    getMe,
    setupAccount,
    logoutUser,
    updateMyProfile,
    changeMyPassword
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// --- Public Routes (No auth required) ---
router.post('/login', loginUser);
router.post('/setup-account', setupAccount);
router.post('/logout', logoutUser);

// --- Protected Routes (Auth required) ---
router.get('/me', protect, getMe);
router.put('/profile', protect, updateMyProfile);
router.put('/change-password', protect, changeMyPassword);


export default router;