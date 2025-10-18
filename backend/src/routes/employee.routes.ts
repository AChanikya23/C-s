import { Router } from 'express';
import {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus
} from '../controllers/employee.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), getAllEmployees);
router.get('/:id', authenticate, getEmployee);
router.post('/', authenticate, authorize('ADMIN'), createEmployee);
router.put('/:id', authenticate, authorize('ADMIN'), updateEmployee);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteEmployee);
router.patch('/:id/toggle-status', authenticate, authorize('ADMIN'), toggleEmployeeStatus);

export default router;
