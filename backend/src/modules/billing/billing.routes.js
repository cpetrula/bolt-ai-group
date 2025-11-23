const { Router } = require('express');
const billingController = require('./billing.controller');
const webhookHandler = require('./webhook.handler');
const { authMiddleware } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimit');

const router = Router();

/**
 * Webhook route (no authentication, uses Stripe signature verification)
 * This route needs raw body, so it's defined separately
 */
router.post('/webhooks/stripe', webhookHandler.handleWebhook);

/**
 * Protected routes (authentication required)
 */
router.get(
  '/billing/subscription',
  authMiddleware,
  authLimiter,
  billingController.getSubscription
);

router.post(
  '/billing/create-checkout-session',
  authMiddleware,
  authLimiter,
  billingController.createCheckoutSessionValidation,
  billingController.createCheckoutSession
);

router.post(
  '/billing/portal-session',
  authMiddleware,
  authLimiter,
  billingController.createPortalSessionValidation,
  billingController.createPortalSession
);

module.exports = router;
