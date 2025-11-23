const { Request, Response, NextFunction } = require('express');
const { body, validationResult } = require('express-validator');
const employeeService = require('./employee.service');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Get all employees for the tenant
 * GET /api/employees
 */
const getEmployees = async (
  req,
  res,
  next) => {
  try {
    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const employees = await employeeService.getEmployees(req.user.tenantId);

    res.status(200).json({
      success,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get employee by ID
 * GET /api/employees/:id
 */
const getEmployeeById = async (
  req,
  res,
  next) => {
  try {
    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const employee = await employeeService.getEmployeeById(
      req.user.tenantId,
      req.params.id
    );

    res.status(200).json({
      success,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new employee
 * POST /api/employees
 */
const createEmployee = async (
  req,
  res,
  next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const employee = await employeeService.createEmployee(
      req.user.tenantId,
      req.body
    );

    res.status(201).json({
      success,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an employee
 * PATCH /api/employees/:id
 */
const updateEmployee = async (
  req,
  res,
  next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const employee = await employeeService.updateEmployee(
      req.user.tenantId,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an employee
 * DELETE /api/employees/:id
 */
const deleteEmployee = async (
  req,
  res,
  next) => {
  try {
    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    await employeeService.deleteEmployee(req.user.tenantId, req.params.id);

    res.status(200).json({
      success,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get employee schedule
 * GET /api/employees/:id/schedule
 */
const getEmployeeSchedule = async (
  req,
  res,
  next) => {
  try {
    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const schedules = await employeeService.getEmployeeSchedule(
      req.user.tenantId,
      req.params.id
    );

    res.status(200).json({
      success,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update employee schedule
 * PUT /api/employees/:id/schedule
 */
const updateEmployeeSchedule = async (
  req,
  res,
  next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const schedules = await employeeService.updateEmployeeSchedule(
      req.user.tenantId,
      req.params.id,
      req.body.schedules
    );

    res.status(200).json({
      success,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validation for creating an employee
 */
const createEmployeeValidation = [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('role').optional().trim(),
  body('phone').optional().trim(),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

/**
 * Validation for updating an employee
 */
const updateEmployeeValidation = [
  body('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
  body('role').optional().trim(),
  body('phone').optional().trim(),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

/**
 * Validation for updating employee schedule
 */
const updateEmployeeScheduleValidation = [
  body('schedules').isArray().withMessage('Schedules must be an array'),
  body('schedules.*.dayOfWeek')
    .isInt({ min, max: 6 })
    .withMessage('Day of week must be 0-6'),
  body('schedules.*.startTime')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('schedules.*.endTime')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
];

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, getEmployeeSchedule, updateEmployeeSchedule, createEmployeeValidation, updateEmployeeValidation, updateEmployeeScheduleValidation };
