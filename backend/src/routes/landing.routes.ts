import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Landing routes working' });
});

export default router;
