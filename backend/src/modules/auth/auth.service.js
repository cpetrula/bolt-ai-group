const bcrypt = require('bcrypt');
const { prisma } = require('../../config/db');
const { generateToken, generateResetToken, verifyResetToken } = require('./jwt.utils');
const { generate2FASecret, verify2FAToken } = require('./2fa.utils');
const { AppError } = require('../../middleware/errorHandler');

const SALT_ROUNDS = 12;

// Pre-computed dummy hash for timing attack prevention
// This matches the bcrypt format with the same salt rounds
const DUMMY_HASH = '$2b$12$LIVGc/c/4lZqqUJ/6sHXcOqLqF.mGBCMCzXLRRNqyXLvqRqjLWj3u';

/**
 * Hash a password using bcrypt
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a password with its hash
 */
const comparePassword = async (
  password,
  hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Sign up a new user
 */
const signup = async (data) => {
  const { email, password } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create tenant for the new user
  const tenant = await prisma.tenant.create({
    data: {
      name: `${email.split('@')[0]}'s Business`,
      businessType: 'salon',
      status: 'TRIAL',
    },
  });

  // Create user linked to tenant
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password,
      tenantId: tenant.id,
    },
    select: {
      id,
      email,
      tenantId,
      createdAt,
    },
  });

  // Generate JWT token with tenantId
  const token = generateToken({
    userId: user.id,
    email: user.email,
    tenantId: user.tenantId || undefined,
  });

  return {
    user,
    token,
  };
};

/**
 * Log in an existing user
 */
const login = async (data) => {
  const { email, password, twoFactorToken } = data;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Always perform password comparison to prevent timing attacks
  // Use a dummy hash if user doesn't exist to maintain constant time
  const passwordToCompare = user?.password || DUMMY_HASH;
  const isPasswordValid = await comparePassword(password, passwordToCompare);

  if (!user || !isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    if (!twoFactorToken) {
      throw new AppError('2FA token required', 403);
    }

    if (!user.twoFactorSecret) {
      throw new AppError('2FA not properly configured', 500);
    }

    // Verify 2FA token
    const is2FAValid = verify2FAToken(twoFactorToken, user.twoFactorSecret);

    if (!is2FAValid) {
      throw new AppError('Invalid 2FA token', 401);
    }
  }

  // Generate JWT token with tenantId
  const token = generateToken({
    userId: user.id,
    email: user.email,
    tenantId: user.tenantId || undefined,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      twoFactorEnabled: user.twoFactorEnabled,
      tenantId: user.tenantId,
    },
    token,
  };
};

/**
 * Initiate password reset process
 */
const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Don't reveal if user exists
    return { message: 'If the email exists, a reset link has been sent' };
  }

  // Generate reset token
  const resetToken = generateResetToken(user.id);

  // Save reset token and expiry
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
    },
  });

  // TODO, send email with reset link containing the token
  // Example: sendEmail(user.email, `Reset link: ${FRONTEND_URL}/reset-password?token=${resetToken}`)
  
  return {
    message: 'If the email exists, a reset link has been sent',
  };
};

/**
 * Reset password using reset token
 */
const resetPassword = async (data) => {
  const { token, newPassword } = data;

  // Verify token
  let userId: string;
  try {
    userId = verifyResetToken(token);
  } catch (error) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Find user with valid reset token
  const user = await prisma.user.findFirst({
    where: {
      id,
      resetToken,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password,
      resetToken,
      resetTokenExpiry,
    },
  });

  return {
    message: 'Password reset successfully',
  };
};

/**
 * Setup 2FA for a user
 */
const setup2FA = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.twoFactorEnabled) {
    throw new AppError('2FA is already enabled', 400);
  }

  // Generate 2FA secret
  const { secret, qrCodeUrl } = await generate2FASecret(user.email);

  // Save secret (not enabled yet - requires verification)
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret,
    },
  });

  return {
    secret,
    qrCodeUrl,
  };
};

/**
 * Verify and enable 2FA for a user
 */
const verify2FA = async (userId, token) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.twoFactorSecret) {
    throw new AppError('2FA setup not initiated', 400);
  }

  // Verify token
  const isValid = verify2FAToken(token, user.twoFactorSecret);

  if (!isValid) {
    throw new AppError('Invalid 2FA token', 401);
  }

  // Enable 2FA
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled,
    },
  });

  return {
    message: '2FA enabled successfully',
  };
};

/**
 * Disable 2FA for a user
 */
const disable2FA = async (userId, token) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new AppError('2FA is not enabled', 400);
  }

  // Verify token before disabling
  const isValid = verify2FAToken(token, user.twoFactorSecret);

  if (!isValid) {
    throw new AppError('Invalid 2FA token', 401);
  }

  // Disable 2FA and clear secret
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled,
      twoFactorSecret,
    },
  });

  return {
    message: '2FA disabled successfully',
  };
};

module.exports = { signup, login, forgotPassword, resetPassword, setup2FA, verify2FA, disable2FA };
