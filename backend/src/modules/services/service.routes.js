const { Router } = require('express');
const { authMiddleware } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimit');
const serviceController = require('./service.controller');

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

module.exports = router;
