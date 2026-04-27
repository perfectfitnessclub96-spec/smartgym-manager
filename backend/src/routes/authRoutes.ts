import express from 'express';
import { 
  sendOTP, 
  verifyOTPAndLogin, 
  changePassword, 
  getMemberInfo, 
  updateProfile,
  logout, 
  getMe 
} from '../controllers/authController';
import { authenticate, requireMember } from '../middleware/auth';

const router = express.Router();

// OTP based login (for both Admin & Member)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPAndLogin);

// Member routes
router.post('/member/change-password', authenticate, requireMember, changePassword);
router.get('/member/info', authenticate, requireMember, getMemberInfo);
router.put('/member/profile', authenticate, requireMember, updateProfile);

// Common routes
router.post('/logout', logout);
router.get('/me', getMe);  // Make sure this line exists

export default router;