import { Decimal } from '@prisma/client/runtime/library';

/**
 * Service model types
 */
export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  basePrice: Decimal;
  durationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service addon
 */
export interface ServiceAddon {
  id: string;
  tenantId: string;
  serviceId: string;
  name: string;
  price: Decimal;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create service data
 */
export interface CreateServiceData {
  name: string;
  description?: string;
  basePrice: number;
  durationMinutes: number;
  isActive?: boolean;
  addons?: CreateServiceAddonData[];
}

/**
 * Update service data
 */
export interface UpdateServiceData {
  name?: string;
  description?: string;
  basePrice?: number;
  durationMinutes?: number;
  isActive?: boolean;
}

/**
 * Create service addon data
 */
export interface CreateServiceAddonData {
  name: string;
  price: number;
  durationMinutes: number;
}

/**
 * Service with addons
 */
export interface ServiceWithAddons extends Service {
  addons: ServiceAddon[];
}
