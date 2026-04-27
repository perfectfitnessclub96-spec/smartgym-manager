// backend/src/routes/notificationRoutes.ts
import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { sendEmailToAllMembers } from '../controllers/notificationController';

const router = express.Router();

// Admin only routes
router.post('/send-email-to-all', authenticate, requireAdmin, sendEmailToAllMembers);

export default router;