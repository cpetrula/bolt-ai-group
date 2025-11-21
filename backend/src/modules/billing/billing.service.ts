import { prisma } from '../../config/db';
import { SubscriptionStatus, TenantStatus } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import * as stripeService from './stripe.service';
import {
  CreateCheckoutSessionData,
  CreatePortalSessionData,
  SubscriptionResponse,
} from './subscription.model';

/**
 * Get subscription for tenant
 */
export const getSubscription = async (
  tenantId: string
): Promise<SubscriptionResponse | null> => {
  const subscription = await prisma.subscription.findUnique({
    where: { tenantId },
  });

  if (!subscription) {
    return null;
  }

  return {
    id: subscription.id,
    status: subscription.status,
    plan: subscription.plan,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    trialEnd: subscription.trialEnd,
  };
};

/**
 * Create checkout session for new subscription
 */
export const createCheckoutSession = async (
  data: CreateCheckoutSessionData
): Promise<{ url: string }> => {
  const { tenantId, plan, successUrl, cancelUrl } = data;

  // Check if tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { subscription: true, users: true },
  });

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  // Check if subscription already exists
  if (tenant.subscription) {
    throw new AppError('Subscription already exists for this tenant', 400);
  }

  // Get primary user email for customer creation
  const primaryUser = tenant.users[0];
  if (!primaryUser) {
    throw new AppError('No user found for tenant', 400);
  }

  try {
    // Create or retrieve Stripe customer
    const customer = await stripeService.createCustomer(
      primaryUser.email,
      tenantId
    );

    // Create subscription record in database
    await prisma.subscription.create({
      data: {
        tenantId,
        stripeCustomerId: customer.id,
        plan,
        status: SubscriptionStatus.TRIALING,
      },
    });

    // Get price ID for the plan
    const priceId = stripeService.getPriceId(plan);

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      customer.id,
      priceId,
      successUrl,
      cancelUrl,
      tenantId
    );

    if (!session.url) {
      throw new AppError('Failed to create checkout session', 500);
    }

    logger.info(`Checkout session created for tenant ${tenantId}`);

    return { url: session.url };
  } catch (error) {
    logger.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Create customer portal session
 */
export const createPortalSession = async (
  data: CreatePortalSessionData
): Promise<{ url: string }> => {
  const { tenantId, returnUrl } = data;

  // Get subscription with Stripe customer ID
  const subscription = await prisma.subscription.findUnique({
    where: { tenantId },
  });

  if (!subscription) {
    throw new AppError('No subscription found for this tenant', 404);
  }

  try {
    const session = await stripeService.createPortalSession(
      subscription.stripeCustomerId,
      returnUrl
    );

    logger.info(`Portal session created for tenant ${tenantId}`);

    return { url: session.url };
  } catch (error) {
    logger.error('Error creating portal session:', error);
    throw error;
  }
};

/**
 * Update subscription status from Stripe webhook
 */
export const updateSubscriptionFromStripe = async (
  stripeSubscriptionId: string,
  status: string,
  currentPeriodStart: number,
  currentPeriodEnd: number,
  cancelAtPeriodEnd: boolean
): Promise<void> => {
  try {
    // Map Stripe status to our enum
    let subscriptionStatus: SubscriptionStatus;
    switch (status) {
      case 'active':
        subscriptionStatus = SubscriptionStatus.ACTIVE;
        break;
      case 'past_due':
        subscriptionStatus = SubscriptionStatus.PAST_DUE;
        break;
      case 'canceled':
        subscriptionStatus = SubscriptionStatus.CANCELED;
        break;
      case 'unpaid':
        subscriptionStatus = SubscriptionStatus.UNPAID;
        break;
      case 'trialing':
        subscriptionStatus = SubscriptionStatus.TRIALING;
        break;
      default:
        subscriptionStatus = SubscriptionStatus.INACTIVE;
    }

    // Update subscription
    const subscription = await prisma.subscription.update({
      where: { stripeSubscriptionId },
      data: {
        status: subscriptionStatus,
        currentPeriodStart: new Date(currentPeriodStart * 1000),
        currentPeriodEnd: new Date(currentPeriodEnd * 1000),
        cancelAtPeriodEnd,
      },
      include: { tenant: true },
    });

    // Update tenant status based on subscription status
    let tenantStatus: TenantStatus;
    if (
      subscriptionStatus === SubscriptionStatus.ACTIVE ||
      subscriptionStatus === SubscriptionStatus.TRIALING
    ) {
      tenantStatus = TenantStatus.ACTIVE;
    } else if (subscriptionStatus === SubscriptionStatus.PAST_DUE) {
      tenantStatus = TenantStatus.SUSPENDED;
    } else {
      tenantStatus = TenantStatus.INACTIVE;
    }

    await prisma.tenant.update({
      where: { id: subscription.tenantId },
      data: { status: tenantStatus },
    });

    // Provision phone number if subscription becomes active and tenant doesn't have one
    if (
      (subscriptionStatus === SubscriptionStatus.ACTIVE ||
        subscriptionStatus === SubscriptionStatus.TRIALING) &&
      !subscription.tenant.twilioPhoneNumber
    ) {
      try {
        // Import telephony service here to avoid circular dependencies
        const { provisionPhoneNumber } = await import('../telephony/twilio.service');
        const phoneNumber = await provisionPhoneNumber(
          subscription.tenantId,
          subscription.tenant.name
        );

        await prisma.tenant.update({
          where: { id: subscription.tenantId },
          data: { twilioPhoneNumber: phoneNumber },
        });

        logger.info(
          `Phone number ${phoneNumber} provisioned for tenant ${subscription.tenantId}`
        );
      } catch (phoneError) {
        logger.error('Error provisioning phone number:', phoneError);
        // Don't fail the subscription update if phone provisioning fails
      }
    }

    logger.info(
      `Subscription ${stripeSubscriptionId} updated to status ${subscriptionStatus}`
    );
  } catch (error) {
    logger.error('Error updating subscription from Stripe:', error);
    throw error;
  }
};

/**
 * Handle successful checkout completion
 */
export const handleCheckoutComplete = async (
  stripeSubscriptionId: string,
  tenantId: string
): Promise<void> => {
  try {
    // Update subscription with Stripe subscription ID
    await prisma.subscription.update({
      where: { tenantId },
      data: {
        stripeSubscriptionId,
      },
    });

    logger.info(`Checkout completed for tenant ${tenantId}`);
  } catch (error) {
    logger.error('Error handling checkout complete:', error);
    throw error;
  }
};

/**
 * Handle subscription deletion
 */
export const handleSubscriptionDeleted = async (
  stripeSubscriptionId: string
): Promise<void> => {
  try {
    const subscription = await prisma.subscription.update({
      where: { stripeSubscriptionId },
      data: {
        status: SubscriptionStatus.CANCELED,
      },
    });

    // Update tenant status
    await prisma.tenant.update({
      where: { id: subscription.tenantId },
      data: { status: TenantStatus.INACTIVE },
    });

    logger.info(`Subscription ${stripeSubscriptionId} deleted`);
  } catch (error) {
    logger.error('Error handling subscription deleted:', error);
    throw error;
  }
};
