import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { apiLimiter } from '../../middleware/rateLimit';
import * as serviceController from './service.controller';

const router = Router();

/**
 * All service routes require authentication and rate limiting
 */

// Service CRUD operations
router.get('/', apiLimiter, authMiddleware, serviceController.getServices);
router.post(
  '/',
  apiLimiter,
  authMiddleware,
  serviceController.createServiceValidation,
  serviceController.createService
);
router.get('/:id', apiLimiter, authMiddleware, serviceController.getServiceById);
router.patch(
  '/:id',
  apiLimiter,
  authMiddleware,
  serviceController.updateServiceValidation,
  serviceController.updateService
);
router.delete('/:id', apiLimiter, authMiddleware, serviceController.deleteService);

export default router;
