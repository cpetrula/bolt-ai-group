const { Request, Response, NextFunction } = require('express');
const { body, validationResult } = require('express-validator');
const { SubscriptionPlan } = require('@prisma/client');
const billingService = require('./billing.service');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Validation middleware
 */
const validateRequest = (req, _res, next) => {
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
const createCheckoutSessionValidation = [
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
const createPortalSessionValidation = [
  body('returnUrl')
    .isURL()
    .withMessage('Return URL must be a valid URL'),
  validateRequest,
];

/**
 * Get subscription for current tenant
 */
const getSubscription = async (
  req,
  res,
  next) => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const subscription = await billingService.getSubscription(tenantId);

    if (!subscription) {
      res.status(404).json({
        success,
        message: 'No subscription found',
      });
      return;
    }

    res.status(200).json({
      success,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create checkout session for subscription
 */
const createCheckoutSession = async (
  req,
  res,
  next) => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const { plan, successUrl, cancelUrl } = req.body;

    const result = await billingService.createCheckoutSession({
      tenantId,
      plan,
      successUrl,
      cancelUrl,
    });

    res.status(200).json({
      success,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create customer portal session
 */
const createPortalSession = async (
  req,
  res,
  next) => {
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
      success,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCheckoutSessionValidation, createPortalSessionValidation, getSubscription, createCheckoutSession, createPortalSession };
