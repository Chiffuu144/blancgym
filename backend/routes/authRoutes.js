import { Router } from 'express';
import { login, me, register, updateProfile, requestPasswordReset, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/me', protect, me);
router.patch('/me', protect, updateProfile);
export default router;
