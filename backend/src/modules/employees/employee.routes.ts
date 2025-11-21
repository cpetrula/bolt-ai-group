import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { apiLimiter } from '../../middleware/rateLimit';
import * as employeeController from './employee.controller';

const router = Router();

/**
 * All employee routes require authentication and rate limiting
 */

// Employee CRUD operations
router.get('/', apiLimiter, authMiddleware, employeeController.getEmployees);
router.post(
  '/',
  apiLimiter,
  authMiddleware,
  employeeController.createEmployeeValidation,
  employeeController.createEmployee
);
router.get('/:id', apiLimiter, authMiddleware, employeeController.getEmployeeById);
router.patch(
  '/:id',
  apiLimiter,
  authMiddleware,
  employeeController.updateEmployeeValidation,
  employeeController.updateEmployee
);
router.delete('/:id', apiLimiter, authMiddleware, employeeController.deleteEmployee);

// Employee schedule operations
router.get('/:id/schedule', apiLimiter, authMiddleware, employeeController.getEmployeeSchedule);
router.put(
  '/:id/schedule',
  apiLimiter,
  authMiddleware,
  employeeController.updateEmployeeScheduleValidation,
  employeeController.updateEmployeeSchedule
);

export default router;
