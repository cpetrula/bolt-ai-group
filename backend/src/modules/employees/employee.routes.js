const { Router } = require('express');
const { authMiddleware } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimit');
const employeeController = require('./employee.controller');

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

module.exports = router;
