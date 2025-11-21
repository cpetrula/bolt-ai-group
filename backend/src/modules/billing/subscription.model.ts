import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';

/**
 * Subscription model types
 */
export interface Subscription {
  id: string;
  tenantId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create checkout session data
 */
export interface CreateCheckoutSessionData {
  tenantId: string;
  plan: SubscriptionPlan;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create portal session data
 */
export interface CreatePortalSessionData {
  tenantId: string;
  returnUrl: string;
}

/**
 * Subscription response
 */
export interface SubscriptionResponse {
  id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
}
