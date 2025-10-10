// /backend/src/routes/authRoutes.ts

import { Router } from 'express';
// 1. Add logoutUser to the import
import { loginUser, getMe, setupAccount, logoutUser } from '../controllers/authController';

const router = Router();

router.post('/login', loginUser);
router.get('/me', getMe);
router.post('/setup-account', setupAccount);

// 2. Add the new logout route. We use POST as a best practice for actions that change state.
router.post('/logout', logoutUser);

export default router;