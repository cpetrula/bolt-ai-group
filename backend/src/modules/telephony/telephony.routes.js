const { Router } = require('express');
const telephonyController = require('./telephony.controller');
const callHandler = require('./call.handler');
const smsHandler = require('./sms.handler');
const { authMiddleware } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimit');

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
  apiLimiter,
  telephonyController.getCallLogs
);

// Get notifications
router.get(
  '/telephony/notifications',
  authMiddleware,
  apiLimiter,
  telephonyController.getNotifications
);

// Send SMS
router.post(
  '/telephony/sms',
  authMiddleware,
  apiLimiter,
  telephonyController.sendSMSValidation,
  telephonyController.sendSMS
);

// Send appointment confirmation
router.post(
  '/telephony/appointment-confirmation',
  authMiddleware,
  apiLimiter,
  telephonyController.sendAppointmentNotificationValidation,
  telephonyController.sendAppointmentConfirmation
);

// Send appointment reminder
router.post(
  '/telephony/appointment-reminder',
  authMiddleware,
  apiLimiter,
  telephonyController.sendAppointmentNotificationValidation,
  telephonyController.sendAppointmentReminder
);

// Get tenant phone number
router.get(
  '/telephony/phone-number',
  authMiddleware,
  apiLimiter,
  telephonyController.getPhoneNumber
);

// Provision phone number
router.post(
  '/telephony/provision-phone',
  authMiddleware,
  apiLimiter,
  telephonyController.provisionPhoneNumber
);

module.exports = router;
