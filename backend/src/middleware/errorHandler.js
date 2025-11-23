const { logger } = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`);
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Handle unexpected errors
  logger.error(`Unexpected error: ${err.message}`);
  logger.error(err.stack || '');

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

const notFoundHandler = (req, _res, next) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

module.exports = { AppError, errorHandler, notFoundHandler };
