import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../../config/db';
import * as tenantService from './tenant.service';
import { AppError } from '../../middleware/errorHandler';

/**
 * Get current user with tenant information
 * GET /api/me
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    // Get user from database with tenant information
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            businessType: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tenant settings
 * GET /api/tenant/settings
 */
export const getTenantSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const settings = await tenantService.getTenantSettings(req.user.tenantId);

    res.status(200).json({
      success: true,
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
export const updateTenantSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
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
      success: true,
      data: updatedTenant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validation for updating tenant settings
 */
export const updateTenantSettingsValidation = [
  body('businessHours').optional().isObject().withMessage('Business hours must be an object'),
  body('timezone').optional().isString().withMessage('Timezone must be a string'),
  body('currency').optional().isString().withMessage('Currency must be a string'),
  body('locale').optional().isString().withMessage('Locale must be a string'),
  body('notifications').optional().isObject().withMessage('Notifications must be an object'),
];
