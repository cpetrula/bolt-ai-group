import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { apiLimiter } from '../../middleware/rateLimit';
import * as reportsController from './reports.controller';

const router = Router();

/**
 * All report routes require authentication and rate limiting
 */

// Call logs report
router.get(
  '/reports/calls',
  apiLimiter,
  authMiddleware,
  reportsController.dateRangeValidation,
  reportsController.getCallLogsReport
);

// Appointments report
router.get(
  '/reports/appointments',
  apiLimiter,
  authMiddleware,
  reportsController.dateRangeValidation,
  reportsController.getAppointmentsReport
);

// Revenue report
router.get(
  '/reports/revenue',
  apiLimiter,
  authMiddleware,
  reportsController.dateRangeValidation,
  reportsController.getRevenueReport
);

export default router;
