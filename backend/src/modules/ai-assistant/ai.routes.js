const { Router } = require('express');
const { vapiAuthMiddleware } = require('../../middleware/vapiAuth');
const { apiLimiter } = require('../../middleware/rateLimit');
const aiController = require('./ai.controller');

const router = Router();

/**
 * AI Assistant Routes
 * These endpoints are designed to be called by AI assistants (Vapi, etc.)
 * or frontend applications for AI-powered features
 */

/**
 * Check availability for booking
 * POST /api/ai/availability
 */
router.post(
  '/availability',
  apiLimiter,
  vapiAuthMiddleware,
  aiController.checkAvailabilityValidation,
  aiController.checkAvailability
);

/**
 * Manage appointments (create, update, cancel, get)
 * POST /api/ai/appointments
 */
router.post(
  '/appointments',
  apiLimiter,
  vapiAuthMiddleware,
  aiController.manageAppointmentValidation,
  aiController.manageAppointment
);

/**
 * Get service information
 * POST /api/ai/services
 */
router.post(
  '/services',
  apiLimiter,
  vapiAuthMiddleware,
  aiController.getServiceInfo
);

/**
 * Process natural language input
 * POST /api/ai/process
 */
router.post(
  '/process',
  apiLimiter,
  vapiAuthMiddleware,
  aiController.processInputValidation,
  aiController.processInput
);

/**
 * Webhook endpoint for Vapi events
 * POST /api/ai/webhooks/vapi
 * Note: This endpoint does not require authentication's called by Vapi
 */
router.post(
  '/webhooks/vapi',
  aiController.handleVapiWebhook
);

module.exports = router;
