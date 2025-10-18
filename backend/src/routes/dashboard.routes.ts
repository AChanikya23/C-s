import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, (req, res) => {
  res.json({
    totalHospitals: 353,
    totalRevenue: '110.50M',
    activePlans: 10,
    expiredPlans: 325
  });
});

router.get('/income-overview', authenticate, (req, res) => {
  res.json([
    { date: '01-10-25', income: 0 },
    { date: '02-10-25', income: 0 },
    { date: '03-10-25', income: 0 }
  ]);
});

export default router;
