import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  tenantId?: string;
}

/**
 * Generate a JWT token for a user
 */
export const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as StringValue,
  };
  return jwt.sign(payload, env.jwtSecret, options);
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate a password reset token (short-lived)
 */
export const generateResetToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: '1h' as StringValue, // Reset tokens expire in 1 hour
  };
  return jwt.sign({ userId }, env.jwtSecret, options);
};

/**
 * Verify a password reset token
 */
export const verifyResetToken = (token: string): string => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
};
