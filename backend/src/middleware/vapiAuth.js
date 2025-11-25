const { verifyToken } = require('../modules/auth/jwt.utils');
const { prisma } = require('../config/db');
const { AppError } = require('./errorHandler');
const { logger } = require('../utils/logger');

/**
 * Middleware to authenticate requests from Vapi or fall back to JWT authentication.
 * 
 * Vapi sends function call requests with tenant context in the request body.
 * This middleware checks for Vapi metadata and validates the tenant exists.
 * If no Vapi metadata is present, it falls back to normal JWT authentication.
 */
const vapiAuthMiddleware = async (req, _res, next) => {
  try {
    // First, try to extract tenant from JWT token (for regular authenticated requests)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = verifyToken(token);
        
        if (payload) {
          req.user = payload;
          req.tenantId = payload.tenantId;
          return next();
        }
      } catch (error) {
        // Token verification failed - continue to check for Vapi metadata
        logger.debug('JWT verification failed, checking for Vapi metadata');
      }
    }

    // Check for Vapi metadata in request body
    // Vapi sends tenantId in the request body (either directly or in metadata)
    const tenantId = req.body?.tenantId || req.body?.metadata?.tenantId;
    
    if (tenantId && typeof tenantId === 'string') {
      const trimmedTenantId = tenantId.trim();
      
      // Validate that tenantId is a valid UUID format
      if (!trimmedTenantId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedTenantId)) {
        throw new AppError('Invalid tenant ID format. Must be a valid UUID.', 400);
      }

      // Validate that the tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { id: trimmedTenantId },
        select: {
          id: true,
          name: true,
          businessType: true,
        },
      });

      if (!tenant) {
        throw new AppError('Tenant not found', 404);
      }

      // Set tenant context for the request
      req.tenantId = tenant.id;
      req.tenant = tenant;
      // Create a user-like object for compatibility with existing code
      req.user = {
        tenantId: tenant.id,
        isVapiRequest: true,
      };

      logger.debug('Vapi request authenticated', { tenantId: tenant.id });
      return next();
    }

    // No valid JWT and no Vapi metadata - reject the request
    throw new AppError('Authentication required: provide JWT token or valid tenant ID', 401);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', 401));
    }
  }
};

module.exports = { vapiAuthMiddleware };
