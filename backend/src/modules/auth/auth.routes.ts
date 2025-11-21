import { Router } from 'express';
import * as authController from './auth.controller';
import { authMiddleware } from '../../middleware/auth';
import { authLimiter, passwordResetLimiter, twoFactorLimiter } from '../../middleware/rateLimit';

const router = Router();

/**
 * Public routes (no authentication required)
 */
router.post(
  '/signup',
  authLimiter,
  authController.signupValidation,
  authController.signup
);

router.post(
  '/login',
  authLimiter,
  authController.loginValidation,
  authController.login
);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  authController.forgotPasswordValidation,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  passwordResetLimiter,
  authController.resetPasswordValidation,
  authController.resetPassword
);

/**
 * Protected routes (authentication required)
 */
router.post(
  '/2fa/setup',
  authMiddleware,
  twoFactorLimiter,
  authController.setup2FA
);

router.post(
  '/2fa/verify',
  authMiddleware,
  twoFactorLimiter,
  authController.twoFactorValidation,
  authController.verify2FA
);

router.post(
  '/2fa/disable',
  authMiddleware,
  twoFactorLimiter,
  authController.twoFactorValidation,
  authController.disable2FA
);

export default router;
