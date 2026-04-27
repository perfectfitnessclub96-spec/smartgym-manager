import express from 'express';
import { authenticate, requireAdmin, requireMember } from '../middleware/auth';
import {
  requestRenewal,
  getAllRenewalRequests,
  getRenewalRequestsByStatus,
  getRenewalRequestById,
  updateRenewalStatus,
  deleteRenewalRequest,
  getPendingCount
} from '../controllers/renewalController';

const router = express.Router();

// Member routes
router.post('/request', authenticate, requireMember, requestRenewal);

// Admin routes
router.get('/requests', authenticate, requireAdmin, getAllRenewalRequests);
router.get('/requests/status/:status', authenticate, requireAdmin, getRenewalRequestsByStatus);
router.get('/requests/:id', authenticate, requireAdmin, getRenewalRequestById);
router.get('/pending/count', authenticate, requireAdmin, getPendingCount);
router.put('/:id/status', authenticate, requireAdmin, updateRenewalStatus);
router.delete('/:id', authenticate, requireAdmin, deleteRenewalRequest);

export default router;