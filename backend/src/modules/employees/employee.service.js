const { prisma } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeScheduleInput, } = require('./employee.model');

/**
 * Get all employees for a tenant
 */
const getEmployees = async (tenantId) => {
  const employees = await prisma.employee.findMany({
    where: { tenantId },
    select: {
      id,
      tenantId,
      name,
      role,
      phone,
      email,
      isActive,
      createdAt,
      updatedAt,
    },
    orderBy: { name: 'asc' },
  });

  return employees;
};

/**
 * Get employee by ID
 */
const getEmployeeById = async (tenantId, employeeId) => {
  const employee = await prisma.employee.findFirst({
    where: {
      id,
      tenantId,
    },
    select: {
      id,
      tenantId,
      name,
      role,
      phone,
      email,
      isActive,
      createdAt,
      updatedAt,
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
const createEmployee = async (
  tenantId,
  data) => {
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
      id,
      tenantId,
      name,
      role,
      phone,
      email,
      isActive,
      createdAt,
      updatedAt,
    },
  });

  return employee;
};

/**
 * Update an employee
 */
const updateEmployee = async (
  tenantId,
  employeeId,
  data) => {
  // Verify employee exists and belongs to tenant
  await getEmployeeById(tenantId, employeeId);

  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data,
    select: {
      id,
      tenantId,
      name,
      role,
      phone,
      email,
      isActive,
      createdAt,
      updatedAt,
    },
  });

  return employee;
};

/**
 * Delete an employee
 */
const deleteEmployee = async (tenantId, employeeId) => {
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
const getEmployeeSchedule = async (
  tenantId,
  employeeId) => {
  // Verify employee exists and belongs to tenant
  await getEmployeeById(tenantId, employeeId);

  const schedules = await prisma.employeeSchedule.findMany({
    where: {
      employeeId,
      tenantId,
    },
    select: {
      id,
      tenantId,
      employeeId,
      dayOfWeek,
      startTime,
      endTime,
      createdAt,
      updatedAt,
    },
    orderBy: { dayOfWeek: 'asc' },
  });

  return schedules;
};

/**
 * Update employee schedule
 */
const updateEmployeeSchedule = async (
  tenantId,
  employeeId,
  schedules) => {
  // Verify employee exists and belongs to tenant
  await getEmployeeById(tenantId, employeeId);

  // Validate schedules
  for (const schedule of schedules) {
    if (schedule.dayOfWeek < 0 || schedule.dayOfWeek > 6) {
      throw new AppError('Invalid day of week (must be 0-6)', 400);
    }
    // Validate time format (HH)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(schedule.startTime) || !timeRegex.test(schedule.endTime)) {
      throw new AppError('Invalid time format (must be HH)', 400);
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

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, getEmployeeSchedule, updateEmployeeSchedule };
