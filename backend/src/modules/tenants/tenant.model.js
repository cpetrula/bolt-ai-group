const { TenantStatus } = require('@prisma/client');

/**
 * Tenant model types
 */
/**
 * Tenant settings structure
 */
;
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  timezone?: string;
  currency?: string;
  locale?: string;
  notifications?: {
    email?: boolean;
    sms?: boolean;
  };
}

/**
 * Create tenant data
 */
/**
 * Update tenant settings data
 */
