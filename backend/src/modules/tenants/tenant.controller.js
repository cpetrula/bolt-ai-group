const { Request, Response, NextFunction } = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../../config/db');
const tenantService = require('./tenant.service');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Get current user with tenant information
 * GET /api/me
 */
const getCurrentUser = async (
  req,
  res,
  next) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    // Get user from database with tenant information
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id,
        email,
        isEmailVerified,
        twoFactorEnabled,
        tenantId,
        createdAt,
        updatedAt,
        tenant: {
          select: {
            id,
            name,
            businessType,
            status,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
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
 * Get tenant settings
 * GET /api/tenant/settings
 */
const getTenantSettings = async (
  req,
  res,
  next) => {
  try {
    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const settings = await tenantService.getTenantSettings(req.user.tenantId);

    res.status(200).json({
      success,
      data: settings || {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update tenant settings
 * PATCH /api/tenant/settings
 */
const updateTenantSettings = async (
  req,
  res,
  next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const updatedTenant = await tenantService.updateTenantSettings(
      req.user.tenantId,
      { settings: req.body }
    );

    res.status(200).json({
      success,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validation for updating tenant settings
 */
const updateTenantSettingsValidation = [
  body('businessHours').optional().isObject().withMessage('Business hours must be an object'),
  body('timezone').optional().isString().withMessage('Timezone must be a string'),
  body('currency').optional().isString().withMessage('Currency must be a string'),
  body('locale').optional().isString().withMessage('Locale must be a string'),
  body('notifications').optional().isObject().withMessage('Notifications must be an object'),
];

module.exports = { getCurrentUser, getTenantSettings, updateTenantSettings, updateTenantSettingsValidation };
