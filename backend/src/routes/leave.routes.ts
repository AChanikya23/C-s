import { Router } from 'express';
import { 
  createLeave, 
  getMyLeaves, 
  getAllLeaves, 
  updateLeaveStatus, 
  deleteLeave 
} from '../controllers/leave.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Employee routes
router.post('/', authenticate, createLeave);
router.get('/my-leaves', authenticate, getMyLeaves);

// Admin routes
router.get('/all', authenticate, authorize('ADMIN'), getAllLeaves);
router.patch('/:id/status', authenticate, authorize('ADMIN'), updateLeaveStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteLeave);

export default router;
