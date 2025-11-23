const { Request, Response } = require('express');
const Stripe = require('stripe');
const { logger } = require('../../utils/logger');
const stripeService = require('./stripe.service');
const billingService = require('./billing.service');

/**
 * Extended Stripe Subscription interface to include properties
 * that exist in the API but may not be in the type definitions
 */
interface StripeSubscriptionExtended extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

/**
 * Extended Stripe Invoice interface to include subscription property
 * that exists in the API but may not be in the type definitions
 */
interface StripeInvoiceExtended extends Stripe.Invoice {
  subscription: string | Stripe.Subscription | null;
}

/**
 * Handle Stripe webhook events
 */
const handleWebhook = async (
  req,
  res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    logger.error('Missing stripe-signature header');
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  let event: Stripe.Event;

  try {
    // Construct event from raw body
    event = stripeService.constructWebhookEvent(req.body, signature);
  } catch (error) {
    logger.error('Webhook signature verification failed:', error);
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  logger.info(`Received webhook event: ${event.type}`);

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).send('Webhook processing failed');
  }
};

/**
 * Handle checkout session completed
 */
const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  const { subscription, metadata } = session;

  if (!subscriptionId || typeof subscriptionId !== 'string') {
    logger.error('No subscription ID in checkout session');
    return;
  }

  if (!metadata?.tenantId) {
    logger.error('No tenant ID in checkout session metadata');
    return;
  }

  await billingService.handleCheckoutComplete(
    subscriptionId,
    metadata.tenantId
  );

  logger.info(
    `Checkout session completed for tenant ${metadata.tenantId}, subscription ${subscriptionId}`
  );
};

/**
 * Handle subscription created or updated
 */
const handleSubscriptionUpdate = async (
  subscription: Stripe.Subscription
) => {
  const sub = subscription;
  const {
    id,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
  } = sub;

  await billingService.updateSubscriptionFromStripe(
    id,
    status,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd
  );

  logger.info(`Subscription ${id} updated to status ${status}`);
};

/**
 * Handle subscription deleted
 */
const handleSubscriptionDeleted = async (
  subscription: Stripe.Subscription
) => {
  const { id } = subscription;

  await billingService.handleSubscriptionDeleted(id);

  logger.info(`Subscription ${id} deleted`);
};

/**
 * Handle invoice payment succeeded
 */
const handleInvoicePaymentSucceeded = async (
  invoice: Stripe.Invoice
) => {
  const inv = invoice;
  const subscriptionId = typeof inv.subscription === 'string' 
    ? inv.subscription 
    : inv.subscription?.id;

  if (!subscriptionId) {
    logger.info('Invoice not associated with a subscription');
    return;
  }

  logger.info(`Payment succeeded for subscription ${subscriptionId}`);
};

/**
 * Handle invoice payment failed
 */
const handleInvoicePaymentFailed = async (
  invoice: Stripe.Invoice
) => {
  const inv = invoice;
  const subscriptionId = typeof inv.subscription === 'string' 
    ? inv.subscription 
    : inv.subscription?.id;

  if (!subscriptionId) {
    logger.info('Invoice not associated with a subscription');
    return;
  }

  logger.warn(`Payment failed for subscription ${subscriptionId}`);
};

module.exports = { handleWebhook };
