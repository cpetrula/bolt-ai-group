import { prisma } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import {
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeScheduleInput,
} from './employee.model';

/**
 * Get all employees for a tenant
 */
export const getEmployees = async (tenantId: string) => {
  const employees = await prisma.employee.findMany({
    where: { tenantId },
    select: {
      id: true,
      tenantId: true,
      name: true,
      role: true,
      phone: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: 'asc' },
  });

  return employees;
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (tenantId: string, employeeId: string) => {
  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,
      tenantId,
    },
    select: {
      id: true,
      tenantId: true,
      name: true,
      role: true,
      phone: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  return employee;
};

/**
 * Create a new employee
 */
export const createEmployee = async (
  tenantId: string,
  data: CreateEmployeeData
) => {
  const { name, role, phone, email, isActive = true } = data;

  const employee = await prisma.employee.create({
    data: {
      tenantId,
      name,
      role,
      phone,
      email,
      isActive,
    },
    select: {
      id: true,
      tenantId: true,
      name: true,
      role: true,
      phone: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return employee;
};

/**
 * Update an employee
 */
export const updateEmployee = async (
  tenantId: string,
  employeeId: string,
  data: UpdateEmployeeData
) => {
  // Verify employee exists and belongs to tenant
  await getEmployeeById(tenantId, employeeId);

  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data,
    select: {
      id: true,
      tenantId: true,
      name: true,
      role: true,
      phone: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return employee;
};

/**
 * Delete an employee
 */
export const deleteEmployee = async (tenantId: string, employeeId: string) => {
  // Verify employee exists and belongs to tenant
  await getEmployeeById(tenantId, employeeId);

  await prisma.employee.delete({
    where: { id: employeeId },
  });

  return { success: true };
};

/**
 * Get employee schedule
 */
export const getEmployeeSchedule = async (
  tenantId: string,
  employeeId: string
) => {
  // Verify employee exists and belongs to tenant
  await getEmployeeById(tenantId, employeeId);

  const schedules = await prisma.employeeSchedule.findMany({
    where: {
      employeeId,
      tenantId,
    },
    select: {
      id: true,
      tenantId: true,
      employeeId: true,
      dayOfWeek: true,
      startTime: true,
      endTime: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { dayOfWeek: 'asc' },
  });

  return schedules;
};

/**
 * Update employee schedule
 */
export const updateEmployeeSchedule = async (
  tenantId: string,
  employeeId: string,
  schedules: EmployeeScheduleInput[]
) => {
  // Verify employee exists and belongs to tenant
  await getEmployeeById(tenantId, employeeId);

  // Validate schedules
  for (const schedule of schedules) {
    if (schedule.dayOfWeek < 0 || schedule.dayOfWeek > 6) {
      throw new AppError('Invalid day of week (must be 0-6)', 400);
    }
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(schedule.startTime) || !timeRegex.test(schedule.endTime)) {
      throw new AppError('Invalid time format (must be HH:MM)', 400);
    }
  }

  // Delete existing schedules and create new ones (replace operation)
  await prisma.$transaction(async (tx) => {
    await tx.employeeSchedule.deleteMany({
      where: {
        employeeId,
        tenantId,
      },
    });

    if (schedules.length > 0) {
      await tx.employeeSchedule.createMany({
        data: schedules.map((schedule) => ({
          tenantId,
          employeeId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        })),
      });
    }
  });

  // Fetch and return updated schedules
  return getEmployeeSchedule(tenantId, employeeId);
};
