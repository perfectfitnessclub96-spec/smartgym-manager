import express from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard', (req: AuthRequest, res) => {
  res.json({ message: 'Admin dashboard data', userId: req.userId });
});

export default router;