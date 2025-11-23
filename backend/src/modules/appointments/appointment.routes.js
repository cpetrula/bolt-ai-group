const { Router } = require('express');
const { authMiddleware } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimit');
const appointmentController = require('./appointment.controller');

const router = Router();

/**
 * All appointment routes require authentication and rate limiting
 */

// Availability endpoint (for AI and frontend)
router.get(
  '/availability',
  apiLimiter,
  authMiddleware,
  appointmentController.getAvailabilityValidation,
  appointmentController.getAvailability
);

// Appointment CRUD operations
router.get(
  '/appointments',
  apiLimiter,
  authMiddleware,
  appointmentController.getAppointments
);

router.post(
  '/appointments',
  apiLimiter,
  authMiddleware,
  appointmentController.createAppointmentValidation,
  appointmentController.createAppointment
);

router.get(
  '/appointments/:id',
  apiLimiter,
  authMiddleware,
  appointmentController.getAppointmentById
);

router.patch(
  '/appointments/:id',
  apiLimiter,
  authMiddleware,
  appointmentController.updateAppointmentValidation,
  appointmentController.updateAppointment
);

router.post(
  '/appointments/:id/cancel',
  apiLimiter,
  authMiddleware,
  appointmentController.cancelAppointmentValidation,
  appointmentController.cancelAppointment
);

router.delete(
  '/appointments/:id',
  apiLimiter,
  authMiddleware,
  appointmentController.deleteAppointment
);

module.exports = router;
