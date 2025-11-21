import Stripe from 'stripe';
import { env } from '../../config/env';
import { SubscriptionPlan } from '@prisma/client';
import { logger } from '../../utils/logger';

/**
 * Initialize Stripe client
 */
const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2025-11-17.clover',
});

/**
 * Get price ID for subscription plan
 */
const getPriceId = (plan: SubscriptionPlan): string => {
  return plan === SubscriptionPlan.MONTHLY
    ? env.stripeMonthlyPriceId
    : env.stripeYearlyPriceId;
};

/**
 * Create a Stripe customer
 */
export const createCustomer = async (
  email: string,
  tenantId: string
): Promise<Stripe.Customer> => {
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
export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  tenantId: string
): Promise<Stripe.Checkout.Session> => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantId,
      },
      subscription_data: {
        trial_period_days: 14,
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
export const createPortalSession = async (
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
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
export const getSubscription = async (
  subscriptionId: string
): Promise<Stripe.Subscription> => {
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
export const cancelSubscription = async (
  subscriptionId: string
): Promise<Stripe.Subscription> => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
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
export const constructWebhookEvent = (
  payload: string | Buffer,
  signature: string
): Stripe.Event => {
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

export { stripe, getPriceId };
