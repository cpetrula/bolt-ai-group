import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Extend Express Request type to include tenant information
declare global {
  namespace Express {
    interface Request {
      tenantId?: number;
      tenant?: {
        id: number;
        name: string;
        businessType: string;
      };
    }
  }
}

/**
 * Multi-tenant middleware
 * Identifies and sets tenant context based on:
 * 1. JWT token (for authenticated requests from users)
 * 2. Custom header (for webhook/API calls)
 * 3. Subdomain (future enhancement)
 */
export const multiTenantMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // For now, we'll use a custom header for tenant identification
    // This will be enhanced with JWT-based tenant extraction later
    const tenantId = req.headers['x-tenant-id'] as string;

    if (tenantId) {
      req.tenantId = parseInt(tenantId, 10);

      if (isNaN(req.tenantId)) {
        throw new AppError('Invalid tenant ID', 400);
      }

      // TODO: Load tenant details from database
      // For now, just store the tenant ID
      req.tenant = {
        id: req.tenantId,
        name: 'Demo Tenant',
        businessType: 'salon',
      };
    }

    // Continue to next middleware
    // Note: Some routes (like public endpoints) may not require tenant context
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to require tenant context
 * Use this for routes that must have tenant information
 */
export const requireTenant = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.tenantId) {
    throw new AppError('Tenant identification required', 401);
  }
  next();
};
