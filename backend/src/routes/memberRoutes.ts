import express from 'express';
import { authenticate, requireMember, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.use(requireMember);

router.get('/dashboard', (req: AuthRequest, res) => {
  res.json({ message: 'Member dashboard data', userId: req.userId });
});

export default router;