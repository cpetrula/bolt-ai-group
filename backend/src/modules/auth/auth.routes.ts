import { Router } from 'express';
import * as authController from './auth.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

/**
 * Public routes (no authentication required)
 */
router.post(
  '/signup',
  authController.signupValidation,
  authController.signup
);

router.post(
  '/login',
  authController.loginValidation,
  authController.login
);

router.post(
  '/forgot-password',
  authController.forgotPasswordValidation,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authController.resetPasswordValidation,
  authController.resetPassword
);

/**
 * Protected routes (authentication required)
 */
router.post(
  '/2fa/setup',
  authMiddleware,
  authController.setup2FA
);

router.post(
  '/2fa/verify',
  authMiddleware,
  authController.twoFactorValidation,
  authController.verify2FA
);

router.post(
  '/2fa/disable',
  authMiddleware,
  authController.twoFactorValidation,
  authController.disable2FA
);

export default router;
