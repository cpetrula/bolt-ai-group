import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { SubscriptionPlan } from '@prisma/client';
import * as billingService from './billing.service';
import { AppError } from '../../middleware/errorHandler';

/**
 * Validation middleware
 */
const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(
      errors.array().map((e) => e.msg).join(', '),
      400
    );
  }
  next();
};

/**
 * Create checkout session validation rules
 */
export const createCheckoutSessionValidation = [
  body('plan')
    .isIn(['MONTHLY', 'YEARLY'])
    .withMessage('Plan must be either MONTHLY or YEARLY'),
  body('successUrl')
    .isURL()
    .withMessage('Success URL must be a valid URL'),
  body('cancelUrl')
    .isURL()
    .withMessage('Cancel URL must be a valid URL'),
  validateRequest,
];

/**
 * Create portal session validation rules
 */
export const createPortalSessionValidation = [
  body('returnUrl')
    .isURL()
    .withMessage('Return URL must be a valid URL'),
  validateRequest,
];

/**
 * Get subscription for current tenant
 */
export const getSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const subscription = await billingService.getSubscription(tenantId);

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'No subscription found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create checkout session for subscription
 */
export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const { plan, successUrl, cancelUrl } = req.body;

    const result = await billingService.createCheckoutSession({
      tenantId,
      plan: plan as SubscriptionPlan,
      successUrl,
      cancelUrl,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create customer portal session
 */
export const createPortalSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const { returnUrl } = req.body;

    const result = await billingService.createPortalSession({
      tenantId,
      returnUrl,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
