import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as serviceController from './service.controller';

const router = Router();

// All service routes require authentication
router.use(authMiddleware);

// Service CRUD operations
router.get('/', serviceController.getServices);
router.post(
  '/',
  serviceController.createServiceValidation,
  serviceController.createService
);
router.get('/:id', serviceController.getServiceById);
router.patch(
  '/:id',
  serviceController.updateServiceValidation,
  serviceController.updateService
);
router.delete('/:id', serviceController.deleteService);

export default router;
