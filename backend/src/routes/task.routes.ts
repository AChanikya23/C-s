import { Router } from 'express';
import { createTask, getMyTasks, getAllTasks, updateTaskStatus, deleteTask } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('ADMIN'), createTask);
router.get('/my', authenticate, getMyTasks);
router.get('/all', authenticate, authorize('ADMIN'), getAllTasks);
router.patch('/:id/status', authenticate, updateTaskStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteTask);

export default router;
