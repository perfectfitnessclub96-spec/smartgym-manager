import express from 'express';
import { authenticate, requireMember, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All member routes require authentication and member role
router.use(authenticate);
router.use(requireMember);

router.get('/dashboard', (req: AuthRequest, res) => {
  res.json({ message: 'Member dashboard data', memberId: req.memberId });
});

export default router;