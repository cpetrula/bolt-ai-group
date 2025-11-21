import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import * as availabilityService from '../appointments/availability.service';
import * as appointmentService from '../appointments/appointment.service';
import * as serviceService from '../services/service.service';
import * as intentHandler from './intent.handler';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

/**
 * AI-callable endpoint to check availability
 * POST /api/ai/availability
 */
export const checkAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
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
      success: true,
      data: {
        date,
        employeeId,
        serviceId,
        availableSlots: availability,
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
export const manageAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
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
          success: true,
          message: 'Appointment created successfully',
          data: result,
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
          success: true,
          message: 'Appointment updated successfully',
          data: result,
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
          success: true,
          message: 'Appointment cancelled successfully',
          data: result,
        });
        break;

      case 'get':
        if (appointmentId) {
          result = await appointmentService.getAppointmentById(tenantId, appointmentId);
        } else {
          result = await appointmentService.getAppointments(tenantId, appointmentData);
        }
        res.status(200).json({
          success: true,
          data: result,
        });
        break;

      default:
        throw new AppError('Invalid action. Must be one of: create, update, cancel, get', 400);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * AI-callable endpoint to get service information
 * POST /api/ai/services
 */
export const getServiceInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const { serviceId } = req.body;

    if (serviceId) {
      const service = await serviceService.getServiceById(tenantId, serviceId);
      res.status(200).json({
        success: true,
        data: service,
      });
    } else {
      const services = await serviceService.getServices(tenantId);
      const activeServices = services.filter((s: any) => s.isActive);
      res.status(200).json({
        success: true,
        data: activeServices,
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
export const processInput = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
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
export const handleVapiWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    res.status(200).json({ success: false, error: 'Internal error' });
  }
};

/**
 * Validation for check availability endpoint
 */
export const checkAvailabilityValidation = [
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
export const manageAppointmentValidation = [
  body('action')
    .isIn(['create', 'update', 'cancel', 'get'])
    .withMessage('Action must be one of: create, update, cancel, get'),
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
export const processInputValidation = [
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
