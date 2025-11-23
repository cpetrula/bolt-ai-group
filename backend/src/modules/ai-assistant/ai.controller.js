const { Request, Response, NextFunction } = require('express');
const { body, validationResult } = require('express-validator');
const availabilityService = require('../appointments/availability.service');
const appointmentService = require('../appointments/appointment.service');
const serviceService = require('../services/service.service');
const intentHandler = require('./intent.handler');
const { AppError } = require('../../middleware/errorHandler');
const { logger } = require('../../utils/logger');

/**
 * AI-callable endpoint to check availability
 * POST /api/ai/availability
 */
const checkAvailability = async (
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

    const tenantId = req.tenantId || req.user?.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const { employeeId, serviceId, date, addonIds } = req.body;

    const availability = await availabilityService.getAvailability(tenantId, {
      employeeId,
      serviceId,
      date,
      addonIds,
    });

    res.status(200).json({
      success,
      data: {
        date,
        employeeId,
        serviceId,
        availableSlots,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * AI-callable endpoint to manage appointments
 * POST /api/ai/appointments
 */
const manageAppointment = async (
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

    const tenantId = req.tenantId || req.user?.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const { action, appointmentId, ...appointmentData } = req.body;

    let result;

    switch (action) {
      case 'create':
        result = await appointmentService.createAppointment(tenantId, appointmentData);
        res.status(201).json({
          success,
          message: 'Appointment created successfully',
          data,
        });
        break;

      case 'update':
        if (!appointmentId) {
          throw new AppError('Appointment ID required for update', 400);
        }
        result = await appointmentService.updateAppointment(
          tenantId,
          appointmentId,
          appointmentData
        );
        res.status(200).json({
          success,
          message: 'Appointment updated successfully',
          data,
        });
        break;

      case 'cancel':
        if (!appointmentId) {
          throw new AppError('Appointment ID required for cancellation', 400);
        }
        result = await appointmentService.cancelAppointment(tenantId, appointmentId, {
          cancellationReason: appointmentData.cancellationReason || 'Customer requested',
        });
        res.status(200).json({
          success,
          message: 'Appointment cancelled successfully',
          data,
        });
        break;

      case 'get':
        if (appointmentId) {
          result = await appointmentService.getAppointmentById(tenantId, appointmentId);
        } else {
          result = await appointmentService.getAppointments(tenantId, appointmentData);
        }
        res.status(200).json({
          success,
          data,
        });
        break;

      default:
        throw new AppError('Invalid action. Must be one of, update, cancel, get', 400);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * AI-callable endpoint to get service information
 * POST /api/ai/services
 */
const getServiceInfo = async (
  req,
  res,
  next) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const { serviceId } = req.body;

    if (serviceId) {
      const service = await serviceService.getServiceById(tenantId, serviceId);
      res.status(200).json({
        success,
        data,
      });
    } else {
      const services = await serviceService.getServices(tenantId);
      const activeServices = services.filter((s) => s.isActive);
      res.status(200).json({
        success,
        data,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Process natural language input from AI assistant
 * POST /api/ai/process
 */
const processInput = async (
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

    const tenantId = req.tenantId || req.user?.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const { userInput, context } = req.body;

    const result = await intentHandler.processUserInput(userInput, {
      tenantId,
      customerPhone: context?.customerPhone,
      customerEmail: context?.customerEmail,
      customerName: context?.customerName,
    });

    res.status(200).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Webhook endpoint for Vapi call events
 * POST /api/ai/webhooks/vapi
 */
const handleVapiWebhook = async (
  req,
  res) => {
  try {
    const event = req.body;

    logger.info('Vapi webhook received:', {
      type: event.type,
      callId: event.call?.id,
    });

    // Handle different event types
    switch (event.type) {
      case 'call-started':
        logger.info('Call started:', event.call);
        break;

      case 'call-ended':
        logger.info('Call ended:', event.call);
        // Store call logs, update metrics, etc.
        break;

      case 'function-call':
        // Handle function calls from the AI assistant
        logger.info('Function call requested:', event.functionCall);
        // Process the function call and return results
        break;

      default:
        logger.info('Unhandled Vapi event type:', event.type);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error handling Vapi webhook:', error);
    // Return 200 even on error to prevent webhook retries
    res.status(200).json({ success, error: 'Internal error' });
  }
};

/**
 * Validation for check availability endpoint
 */
const checkAvailabilityValidation = [
  body('employeeId').notEmpty().trim().withMessage('Employee ID is required'),
  body('serviceId').notEmpty().trim().withMessage('Service ID is required'),
  body('date')
    .notEmpty()
    .isISO8601()
    .withMessage('Valid date is required (ISO 8601 format)'),
  body('addonIds')
    .optional()
    .isArray()
    .withMessage('Addon IDs must be an array'),
];

/**
 * Validation for manage appointment endpoint
 */
const manageAppointmentValidation = [
  body('action')
    .isIn(['create', 'update', 'cancel', 'get'])
    .withMessage('Action must be one of, update, cancel, get'),
  body('appointmentId')
    .optional()
    .trim(),
  body('employeeId')
    .if(body('action').equals('create'))
    .notEmpty()
    .trim()
    .withMessage('Employee ID is required for creating appointments'),
  body('serviceId')
    .if(body('action').equals('create'))
    .notEmpty()
    .trim()
    .withMessage('Service ID is required for creating appointments'),
  body('customerName')
    .if(body('action').equals('create'))
    .notEmpty()
    .trim()
    .withMessage('Customer name is required for creating appointments'),
  body('customerPhone')
    .if(body('action').equals('create'))
    .notEmpty()
    .trim()
    .withMessage('Customer phone is required for creating appointments'),
  body('appointmentDate')
    .if(body('action').equals('create'))
    .notEmpty()
    .isISO8601()
    .withMessage('Valid appointment date is required for creating appointments'),
  body('startTime')
    .if(body('action').equals('create'))
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format for creating appointments'),
];

/**
 * Validation for process input endpoint
 */
const processInputValidation = [
  body('userInput')
    .notEmpty()
    .trim()
    .isString()
    .withMessage('User input is required'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
];

module.exports = { checkAvailability, manageAppointment, getServiceInfo, processInput, handleVapiWebhook, checkAvailabilityValidation, manageAppointmentValidation, processInputValidation };
