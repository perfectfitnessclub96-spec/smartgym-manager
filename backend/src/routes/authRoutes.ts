import express from 'express';
import { sendOTP, verifyOTP, logout, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;