import { Decimal } from '@prisma/client/runtime/library';

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
export interface Appointment {
  id: string;
  tenantId: string;
  employeeId: string;
  serviceId: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  totalPrice: Decimal;
  totalDuration: number;
  notes?: string | null;
  cancellationReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Appointment addon
 */
export interface AppointmentAddon {
  id: string;
  tenantId: string;
  appointmentId: string;
  addonId: string;
  name: string;
  price: Decimal;
  durationMinutes: number;
  createdAt: Date;
}

/**
 * Create appointment data
 */
export interface CreateAppointmentData {
  employeeId: string;
  serviceId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  appointmentDate: string; // ISO date string
  startTime: string; // e.g., "09:00"
  notes?: string;
  addonIds?: string[]; // Array of service addon IDs
}

/**
 * Update appointment data
 */
export interface UpdateAppointmentData {
  employeeId?: string;
  serviceId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  appointmentDate?: string; // ISO date string
  startTime?: string; // e.g., "09:00"
  notes?: string;
  status?: AppointmentStatus;
  addonIds?: string[]; // Array of service addon IDs
}

/**
 * Cancel appointment data
 */
export interface CancelAppointmentData {
  cancellationReason?: string;
}

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
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

/**
 * Availability query parameters
 */
export interface AvailabilityQuery {
  employeeId: string;
  serviceId: string;
  date: string; // ISO date string
  addonIds?: string[];
}
