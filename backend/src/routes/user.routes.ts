import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Placeholder - add your user controllers later
router.get('/', authenticate, authorize('SUPER_ADMIN'), (req, res) => {
  res.json({ message: 'User routes working' });
});

export default router;
