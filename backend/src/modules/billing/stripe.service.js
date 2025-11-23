const Stripe = require('stripe');
const { env } = require('../../config/env');
const { SubscriptionPlan } = require('@prisma/client');
const { logger } = require('../../utils/logger');

/**
 * Initialize Stripe client
 */
const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2025-11-17.clover',
});

/**
 * Get price ID for subscription plan
 */
const getPriceId = (plan) => {
  return plan === SubscriptionPlan.MONTHLY
    ? env.stripeMonthlyPriceId
    : env.stripeYearlyPriceId;
};

/**
 * Create a Stripe customer
 */
const createCustomer = async (
  email,
  tenantId) => {
  try {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        tenantId,
      },
    });
    logger.info(`Stripe customer created: ${customer.id}`);
    return customer;
  } catch (error) {
    logger.error('Error creating Stripe customer:', error);
    throw error;
  }
};

/**
 * Create a checkout session for subscription
 */
const createCheckoutSession = async (
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  tenantId) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price,
          quantity,
        },
      ],
      success_url,
      cancel_url,
      metadata: {
        tenantId,
      },
      subscription_data: {
        trial_period_days,
        metadata: {
          tenantId,
        },
      },
    });
    logger.info(`Checkout session created: ${session.id}`);
    return session;
  } catch (error) {
    logger.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Create a customer portal session
 */
const createPortalSession = async (
  customerId,
  returnUrl) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer,
      return_url,
    });
    logger.info(`Portal session created: ${session.id}`);
    return session;
  } catch (error) {
    logger.error('Error creating portal session:', error);
    throw error;
  }
};

/**
 * Retrieve a subscription from Stripe
 */
const getSubscription = async (
  subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    logger.error('Error retrieving subscription:', error);
    throw error;
  }
};

/**
 * Cancel a subscription
 */
const cancelSubscription = async (
  subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end,
    });
    logger.info(`Subscription ${subscriptionId} set to cancel at period end`);
    return subscription;
  } catch (error) {
    logger.error('Error canceling subscription:', error);
    throw error;
  }
};

/**
 * Construct webhook event from raw body and signature
 */
const constructWebhookEvent = (
  payload,
  signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.stripeWebhookSecret
    );
        return event;
  } catch (error) {
    logger.error('Error constructing webhook event:', error);
    throw error;
  }
};

module.exports = { stripe, getPriceId, createCustomer, createCheckoutSession, createPortalSession, getSubscription, cancelSubscription, constructWebhookEvent };

