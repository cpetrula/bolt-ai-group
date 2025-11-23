const { Request, Response, NextFunction } = require('express');
const { body, query, validationResult } = require('express-validator');
const appointmentService = require('./appointment.service');
const availabilityService = require('./availability.service');
const { AppError } = require('../../middleware/errorHandler');
const { AppointmentStatus } = require('./appointment.model');

/**
 * Get all appointments for the tenant
 * GET /api/appointments
 */
const getAppointments = async (
  req,
  res,
  next) => {
  try {
    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const filters = {
      employeeId: req.query.employeeId | undefined,
      status: req.query.status | undefined,
      startDate: req.query.startDate | undefined,
      endDate: req.query.endDate | undefined,
    };

    const appointments = await appointmentService.getAppointments(
      req.user.tenantId,
      filters
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
 * Get appointment by ID
 * GET /api/appointments/:id
 */
const getAppointmentById = async (
  req,
  res,
  next) => {
  try {
    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const appointment = await appointmentService.getAppointmentById(
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
 * Create a new appointment
 * POST /api/appointments
 */
const createAppointment = async (
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

    const appointment = await appointmentService.createAppointment(
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
 * Update an appointment
 * PATCH /api/appointments/:id
 */
const updateAppointment = async (
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

    const appointment = await appointmentService.updateAppointment(
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
 * Cancel an appointment
 * POST /api/appointments/:id/cancel
 */
const cancelAppointment = async (
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

    const appointment = await appointmentService.cancelAppointment(
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
 * Delete an appointment
 * DELETE /api/appointments/:id
 */
const deleteAppointment = async (
  req,
  res,
  next) => {
  try {
    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    await appointmentService.deleteAppointment(req.user.tenantId, req.params.id);

    res.status(200).json({
      success,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get availability for an employee
 * GET /api/availability
 */
const getAvailability = async (
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

    const availabilityQuery = {
      employeeId: req.query.employeeId,
      serviceId: req.query.serviceId,
      date: req.query.date,
      addonIds: req.query.addonIds
        ? (req.query.addonIds).split(',')
        : undefined,
    };

    const availability = await availabilityService.getAvailability(
      req.user.tenantId,
      availabilityQuery
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
 * Validation for creating an appointment
 */
const createAppointmentValidation = [
  body('employeeId').notEmpty().trim().withMessage('Employee ID is required'),
  body('serviceId').notEmpty().trim().withMessage('Service ID is required'),
  body('customerName').notEmpty().trim().withMessage('Customer name is required'),
  body('customerEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('customerPhone').optional().trim(),
  body('appointmentDate')
    .notEmpty()
    .isISO8601()
    .withMessage('Valid appointment date is required'),
  body('startTime')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('notes').optional().trim(),
  body('addonIds')
    .optional()
    .isArray()
    .withMessage('Addon IDs must be an array'),
];

/**
 * Validation for updating an appointment
 */
const updateAppointmentValidation = [
  body('employeeId').optional().notEmpty().trim().withMessage('Employee ID cannot be empty'),
  body('serviceId').optional().notEmpty().trim().withMessage('Service ID cannot be empty'),
  body('customerName').optional().notEmpty().trim().withMessage('Customer name cannot be empty'),
  body('customerEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('customerPhone').optional().trim(),
  body('appointmentDate')
    .optional()
    .isISO8601()
    .withMessage('Valid appointment date is required'),
  body('startTime')
    .optional()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('notes').optional().trim(),
  body('status')
    .optional()
    .isIn([
      'SCHEDULED',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
    ])
    .withMessage('Invalid status'),
  body('addonIds')
    .optional()
    .isArray()
    .withMessage('Addon IDs must be an array'),
];

/**
 * Validation for cancelling an appointment
 */
const cancelAppointmentValidation = [
  body('cancellationReason').optional().trim(),
];

/**
 * Validation for availability query
 */
const getAvailabilityValidation = [
  query('employeeId').notEmpty().trim().withMessage('Employee ID is required'),
  query('serviceId').notEmpty().trim().withMessage('Service ID is required'),
  query('date')
    .notEmpty()
    .isISO8601()
    .withMessage('Valid date is required'),
  query('addonIds')
    .optional()
    .custom((value) => {
      // Accept both comma-separated string and array
      if (typeof value === 'string') {
        return value.split(',').every((id) => id.trim().length > 0);
      }
      return Array.isArray(value);
    })
    .withMessage('Addon IDs must be a comma-separated string or array of IDs'),
];

module.exports = { getAppointments, getAppointmentById, createAppointment, updateAppointment, cancelAppointment, deleteAppointment, getAvailability, createAppointmentValidation, updateAppointmentValidation, cancelAppointmentValidation, getAvailabilityValidation };
