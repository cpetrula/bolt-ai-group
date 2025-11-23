const { verifyToken } = require('../modules/auth/jwt.utils');
const { AppError } = require('./errorHandler');

/**
 * Auth middleware to protect routes
 * Verifies JWT token from Authorization header
 */
const authMiddleware = (req, _res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', 401));
    }
  }
};

module.exports = { authMiddleware };
