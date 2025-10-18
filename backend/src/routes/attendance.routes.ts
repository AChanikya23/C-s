import { Router } from 'express';
import { checkIn, checkOut, getMyAttendance, getAllAttendance } from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/check-in', authenticate, checkIn);
router.post('/check-out', authenticate, checkOut);
router.get('/my', authenticate, getMyAttendance);
router.get('/all', authenticate, authorize('ADMIN'), getAllAttendance);

export default router;
