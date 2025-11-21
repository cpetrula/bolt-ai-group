import { Router } from 'express';
import * as telephonyController from './telephony.controller';
import * as callHandler from './call.handler';
import * as smsHandler from './sms.handler';
import { authMiddleware } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimit';

const router = Router();

/**
 * Webhook routes (no authentication, handled by Twilio signature validation)
 */
router.post('/webhooks/twilio/voice', callHandler.handleIncomingCall);
router.post('/webhooks/twilio/voice/status', callHandler.handleCallStatus);
router.post('/webhooks/twilio/sms', smsHandler.handleIncomingSMS);

/**
 * Protected routes (authentication required)
 */

// Get call logs
router.get(
  '/telephony/call-logs',
  authMiddleware,
  authLimiter,
  telephonyController.getCallLogs
);

// Get notifications
router.get(
  '/telephony/notifications',
  authMiddleware,
  authLimiter,
  telephonyController.getNotifications
);

// Send SMS
router.post(
  '/telephony/sms',
  authMiddleware,
  authLimiter,
  telephonyController.sendSMSValidation,
  telephonyController.sendSMS
);

// Send appointment confirmation
router.post(
  '/telephony/appointment-confirmation',
  authMiddleware,
  authLimiter,
  telephonyController.sendAppointmentNotificationValidation,
  telephonyController.sendAppointmentConfirmation
);

// Send appointment reminder
router.post(
  '/telephony/appointment-reminder',
  authMiddleware,
  authLimiter,
  telephonyController.sendAppointmentNotificationValidation,
  telephonyController.sendAppointmentReminder
);

// Get tenant phone number
router.get(
  '/telephony/phone-number',
  authMiddleware,
  authLimiter,
  telephonyController.getPhoneNumber
);

// Provision phone number
router.post(
  '/telephony/provision-phone',
  authMiddleware,
  authLimiter,
  telephonyController.provisionPhoneNumber
);

export default router;
