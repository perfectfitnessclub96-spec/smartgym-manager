// backend/src/routes/adminRoutes.ts
import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getAllAdmins,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  triggerCleanup,
  getTodaysBirthdays,
  forceExpiryUpdate  // ✅ ADDED - Import the new function
} from '../controllers/adminController';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Admin management routes
router.get('/users', getAllAdmins);
router.post('/users', addAdmin);
router.put('/users/:id', updateAdmin);
router.delete('/users/:id', deleteAdmin);

// Cleanup route
router.post('/trigger-cleanup', triggerCleanup);

// Birthdays route
router.get('/birthdays/today', getTodaysBirthdays);

// ✅ ADDED - Force update expired memberships
router.post('/force-expiry-update', forceExpiryUpdate);

router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard data' });
});

export default router;