const { Router } = require('express');
const { authMiddleware } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimit');
const reportsController = require('./reports.controller');

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

module.exports = router;
