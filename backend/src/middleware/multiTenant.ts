import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../modules/auth/jwt.utils';
import { prisma } from '../config/db';
import { AppError } from './errorHandler';

// Extend Express Request type to include tenant information
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenant?: {
        id: string;
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
    // First, try to extract tenant from JWT token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = verifyToken(token);
        
        if (payload.tenantId) {
          req.tenantId = payload.tenantId;
          
          // Load tenant details from database
          const tenant = await prisma.tenant.findUnique({
            where: { id: payload.tenantId },
            select: {
              id: true,
              name: true,
              businessType: true,
            },
          });
          
          if (tenant) {
            req.tenant = tenant;
          }
        }
      } catch (error) {
        // Token verification failed - continue without tenant context
        // The auth middleware will handle authentication errors
      }
    }
    
    // Fallback: Use custom header for tenant identification (for API/webhook calls)
    if (!req.tenantId) {
      const tenantId = req.headers['x-tenant-id'] as string;
      
      if (tenantId) {
        // Validate that tenantId is a valid UUID format
        if (!tenantId.trim() || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId.trim())) {
          throw new AppError('Invalid tenant ID format. Must be a valid UUID.', 400);
        }

        req.tenantId = tenantId.trim();

        // Load tenant details from database
        const tenant = await prisma.tenant.findUnique({
          where: { id: req.tenantId },
          select: {
            id: true,
            name: true,
            businessType: true,
          },
        });
        
        if (tenant) {
          req.tenant = tenant;
        }
      }
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
