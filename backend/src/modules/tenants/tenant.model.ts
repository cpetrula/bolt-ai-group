import { TenantStatus } from '@prisma/client';

/**
 * Tenant model types
 */
export interface Tenant {
  id: string;
  name: string;
  businessType: string;
  status: TenantStatus;
  settings?: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tenant settings structure
 */
export interface TenantSettings {
  businessHours?: {
    monday?: { open: string; close: string };
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
export interface CreateTenantData {
  name: string;
  businessType?: string;
  settings?: TenantSettings;
}

/**
 * Update tenant settings data
 */
export interface UpdateTenantSettingsData {
  settings: TenantSettings;
}
