import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  res.json({ message: 'Subscriber routes working' });
});

export default router;
