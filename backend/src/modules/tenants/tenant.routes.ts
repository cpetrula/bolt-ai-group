import { Router } from 'express';
import * as tenantController from './tenant.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

/**
 * All tenant routes require authentication
 */

/**
 * Get current user with tenant information
 * GET /api/me
 */
router.get('/me', authMiddleware, tenantController.getCurrentUser);

/**
 * Get tenant settings
 * GET /api/tenant/settings
 */
router.get('/tenant/settings', authMiddleware, tenantController.getTenantSettings);

/**
 * Update tenant settings
 * PATCH /api/tenant/settings
 */
router.patch(
  '/tenant/settings',
  authMiddleware,
  tenantController.updateTenantSettingsValidation,
  tenantController.updateTenantSettings
);

export default router;
