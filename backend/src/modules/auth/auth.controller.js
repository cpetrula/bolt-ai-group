const { Request, Response, NextFunction } = require('express');
const { body, validationResult } = require('express-validator');
const authService = require('./auth.service');
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
 * Signup validation rules
 */
const signupValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  validateRequest,
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
];

/**
 * Forgot password validation rules
 */
const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  validateRequest,
];

/**
 * Reset password validation rules
 */
const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  validateRequest,
];

/**
 * 2FA token validation rules
 */
const twoFactorValidation = [
  body('token')
    .isLength({ min, max: 6 })
    .isNumeric()
    .withMessage('2FA token must be a 6-digit number'),
  validateRequest,
];

/**
 * Signup controller
 * POST /api/auth/signup
 */
const signup = async (
  req,
  res,
  next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.signup({ email, password });

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login controller
 * POST /api/auth/login
 */
const login = async (
  req,
  res,
  next) => {
  try {
    const { email, password, twoFactorToken } = req.body;

    const result = await authService.login({ email, password, twoFactorToken });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password controller
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (
  req,
  res,
  next) => {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password controller
 * POST /api/auth/reset-password
 */
const resetPassword = async (
  req,
  res,
  next) => {
  try {
    const { token, newPassword } = req.body;

    const result = await authService.resetPassword({ token, newPassword });

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Setup 2FA controller
 * POST /api/auth/2fa/setup
 */
const setup2FA = async (
  req,
  res,
  next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const result = await authService.setup2FA(userId);

    res.status(200).json({
      status: 'success',
      message: 'Scan the QR code with your authenticator app',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify 2FA controller
 * POST /api/auth/2fa/verify
 */
const verify2FA = async (
  req,
  res,
  next) => {
  try {
    const userId = req.user?.userId;
    const { token } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const result = await authService.verify2FA(userId, token);

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable 2FA controller
 * POST /api/auth/2fa/disable
 */
const disable2FA = async (
  req,
  res,
  next) => {
  try {
    const userId = req.user?.userId;
    const { token } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const result = await authService.disable2FA(userId, token);

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signupValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, twoFactorValidation, signup, login, forgotPassword, resetPassword, setup2FA, verify2FA, disable2FA };
