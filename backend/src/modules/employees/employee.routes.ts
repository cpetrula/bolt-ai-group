import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as employeeController from './employee.controller';

const router = Router();

// All employee routes require authentication
router.use(authMiddleware);

// Employee CRUD operations
router.get('/', employeeController.getEmployees);
router.post(
  '/',
  employeeController.createEmployeeValidation,
  employeeController.createEmployee
);
router.get('/:id', employeeController.getEmployeeById);
router.patch(
  '/:id',
  employeeController.updateEmployeeValidation,
  employeeController.updateEmployee
);
router.delete('/:id', employeeController.deleteEmployee);

// Employee schedule operations
router.get('/:id/schedule', employeeController.getEmployeeSchedule);
router.put(
  '/:id/schedule',
  employeeController.updateEmployeeScheduleValidation,
  employeeController.updateEmployeeSchedule
);

export default router;
