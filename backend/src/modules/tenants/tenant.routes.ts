import { Router } from 'express';
import * as tenantController from './tenant.controller';
import { authMiddleware } from '../../middleware/auth';
import { apiLimiter } from '../../middleware/rateLimit';

const router = Router();

/**
 * All tenant routes require authentication and rate limiting
 */

/**
 * Get current user with tenant information
 * GET /api/me
 */
router.get('/me', apiLimiter, authMiddleware, tenantController.getCurrentUser);

/**
 * Get tenant settings
 * GET /api/tenant/settings
 */
router.get('/tenant/settings', apiLimiter, authMiddleware, tenantController.getTenantSettings);

/**
 * Update tenant settings
 * PATCH /api/tenant/settings
 */
router.patch(
  '/tenant/settings',
  apiLimiter,
  authMiddleware,
  tenantController.updateTenantSettingsValidation,
  tenantController.updateTenantSettings
);

export default router;
