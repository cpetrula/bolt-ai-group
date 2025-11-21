/**
 * Employee model types
 */
export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  role?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Employee schedule
 */
export interface EmployeeSchedule {
  id: string;
  tenantId: string;
  employeeId: string;
  dayOfWeek: number; // 0-6, where 0 is Sunday
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "17:00"
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create employee data
 */
export interface CreateEmployeeData {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

/**
 * Update employee data
 */
export interface UpdateEmployeeData {
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

/**
 * Employee schedule input
 */
export interface EmployeeScheduleInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

/**
 * Employee with schedules
 */
export interface EmployeeWithSchedules extends Employee {
  schedules: EmployeeSchedule[];
}
