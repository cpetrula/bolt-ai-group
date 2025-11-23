const { Decimal } = require('@prisma/client/runtime/library');

/**
 * Appointment status enum
 */
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

/**
 * Appointment model types
 */
/**
 * Appointment addon
 */
/**
 * Create appointment data
 */
/**
 * Update appointment data
 */
/**
 * Cancel appointment data
 */
/**
 * Appointment with related data
 */
export interface AppointmentWithDetails extends Appointment {
  addons: AppointmentAddon[];
  employee: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  service: {
    id: string;
    name: string;
    basePrice: Decimal;
    durationMinutes: number;
  };
}

/**
 * Time slot for availability
 */
/**
 * Availability query parameters
 */
