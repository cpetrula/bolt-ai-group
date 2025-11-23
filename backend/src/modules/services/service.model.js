const { Decimal } = require('@prisma/client/runtime/library');

/**
 * Service model types
 */
/**
 * Service addon
 */
/**
 * Create service data
 */
/**
 * Update service data
 */
/**
 * Create service addon data
 */
/**
 * Service with addons
 */
export interface ServiceWithAddons extends Service {
  addons: ServiceAddon[];
}
