const jwt = require('jsonwebtoken');
const { env } = require('../../config/env');

/**
 * Generate a JWT token for a user
 */
const generateToken = (payload) => {
  const options = {
    expiresIn: env.jwtExpiresIn,
  };
  return jwt.sign(payload, env.jwtSecret, options);
};

/**
 * Verify and decode a JWT token
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate a password reset token (short-lived)
 */
const generateResetToken = (userId) => {
  const options = {
    expiresIn: '1h', // Reset tokens expire in 1 hour
  };
  return jwt.sign({ userId }, env.jwtSecret, options);
};

/**
 * Verify a password reset token
 */
const verifyResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
};

module.exports = { generateToken, verifyToken, generateResetToken, verifyResetToken };
