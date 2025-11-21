import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../../config/db';
import * as twilioService from './twilio.service';
import * as smsHandler from './sms.handler';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

/**
 * Validation middleware
 */
const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(
      errors.array().map((e) => e.msg).join(', '),
      400
    );
  }
  next();
};

/**
 * Validation for sending SMS
 */
export const sendSMSValidation = [
  body('phoneNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Phone number must be in E.164 format'),
  body('message')
    .isString()
    .isLength({ min: 1, max: 1600 })
    .withMessage('Message must be between 1 and 1600 characters'),
  validateRequest,
];

/**
 * Validation for sending appointment notification
 */
export const sendAppointmentNotificationValidation = [
  body('appointmentId')
    .isString()
    .withMessage('Appointment ID is required'),
  validateRequest,
];

/**
 * Get call logs for current tenant
 */
export const getCallLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const { startDate, endDate, limit = '50', offset = '0' } = req.query;

    const where: any = { tenantId };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate as string);
      }
    }

    const callLogs = await prisma.callLog.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.callLog.count({ where });

    res.status(200).json({
      success: true,
      data: {
        callLogs,
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notifications for current tenant
 */
export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const { type, status, limit = '50', offset = '0' } = req.query;

    const where: any = { tenantId };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.notification.count({ where });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send SMS to a customer
 */
export const sendSMS = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const { phoneNumber, message } = req.body;

    await smsHandler.sendCustomerNotification(
      tenantId,
      phoneNumber,
      message
    );

    res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send appointment confirmation SMS
 */
export const sendAppointmentConfirmation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const { appointmentId } = req.body;

    await smsHandler.sendAppointmentConfirmation(tenantId, appointmentId);

    res.status(200).json({
      success: true,
      message: 'Appointment confirmation sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send appointment reminder SMS
 */
export const sendAppointmentReminder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const { appointmentId } = req.body;

    await smsHandler.sendAppointmentReminder(tenantId, appointmentId);

    res.status(200).json({
      success: true,
      message: 'Appointment reminder sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tenant's phone number
 */
export const getPhoneNumber = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { twilioPhoneNumber: true },
    });

    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        phoneNumber: tenant.twilioPhoneNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Provision phone number for tenant (admin only)
 */
export const provisionPhoneNumber = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    if (tenant.twilioPhoneNumber) {
      throw new AppError('Phone number already provisioned for this tenant', 400);
    }

    const phoneNumber = await twilioService.provisionPhoneNumber(
      tenantId,
      tenant.name
    );

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { twilioPhoneNumber: phoneNumber },
    });

    logger.info(`Phone number ${phoneNumber} provisioned for tenant ${tenantId}`);

    res.status(200).json({
      success: true,
      data: {
        phoneNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};
