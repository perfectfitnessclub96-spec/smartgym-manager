// backend/src/routes/membershipRoutes.ts
import express from 'express';
import { authenticate, requireAdmin, requireMember } from '../middleware/auth';
import {
  addMember,
  getAllMembers,
  getMemberById,
  getMemberDashboard,
  getMembershipPlans,
  getExpiringSoon,
  getAdminStats,
  renewMembership,
  getMonthlyRevenue,
  getTotalRevenue,
  getPlanDistribution
} from '../controllers/membershipController';

const router = express.Router();

// Public routes (with authentication)
router.get('/plans', authenticate, getMembershipPlans);

// Admin only routes
router.post('/members', authenticate, requireAdmin, addMember);
router.get('/members', authenticate, requireAdmin, getAllMembers);
router.get('/members/:id', authenticate, requireAdmin, getMemberById);
router.get('/expiring-soon', authenticate, requireAdmin, getExpiringSoon);
router.get('/admin/stats', authenticate, requireAdmin, getAdminStats);
router.post('/renew', authenticate, requireAdmin, renewMembership);
router.get('/monthly-revenue', authenticate, requireAdmin, getMonthlyRevenue);
router.get('/total-revenue', authenticate, requireAdmin, getTotalRevenue);
router.get('/plan-distribution', authenticate, requireAdmin, getPlanDistribution);

// Member only routes
router.get('/my-dashboard', authenticate, requireMember, getMemberDashboard);

export default router;