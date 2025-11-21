import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { apiLimiter } from '../../middleware/rateLimit';
import * as aiController from './ai.controller';

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
  authMiddleware,
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
  authMiddleware,
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
  authMiddleware,
  aiController.getServiceInfo
);

/**
 * Process natural language input
 * POST /api/ai/process
 */
router.post(
  '/process',
  apiLimiter,
  authMiddleware,
  aiController.processInputValidation,
  aiController.processInput
);

/**
 * Webhook endpoint for Vapi events
 * POST /api/ai/webhooks/vapi
 * Note: This endpoint does not require authentication as it's called by Vapi
 */
router.post(
  '/webhooks/vapi',
  aiController.handleVapiWebhook
);

export default router;
