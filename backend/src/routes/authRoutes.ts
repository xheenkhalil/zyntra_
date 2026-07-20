// /backend/src/routes/authRoutes.ts

import { Router } from 'express';
import {
  loginUser,
  getMe,
  setupAccount,
  logoutUser,
  updateMyProfile,
  changeMyPassword,
  sendRegistrationOTP,
  verifyOTPAndRegister,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

// --- Public Routes (No auth required) ---

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/auth/setup-account:
 *   post:
 *     summary: Setup a new account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account setup successful
 */
router.post('/setup-account', setupAccount);

/**
 * @swagger
 * /api/auth/register/send-otp:
 *   post:
 *     summary: Send OTP for registration
 *     tags: [Auth]
 */
router.post('/register/send-otp', sendRegistrationOTP);

/**
 * @swagger
 * /api/auth/register/verify-otp-and-create:
 *   post:
 *     summary: Verify OTP and complete registration
 *     tags: [Auth]
 */
router.post('/register/verify-otp-and-create', verifyOTPAndRegister);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', logoutUser);

// --- Protected Routes (Auth required) ---

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', protect, updateMyProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change current user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 */
router.put('/change-password', protect, changeMyPassword);

export default router;
