const { Request, Response, NextFunction } = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../../config/db');
const twilioService = require('./twilio.service');
const smsHandler = require('./sms.handler');
const { AppError } = require('../../middleware/errorHandler');
const { logger } = require('../../utils/logger');

/**
 * Validation middleware
 */
const validateRequest = (req, _res, next) => {
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
const sendSMSValidation = [
  body('phoneNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Phone number must be in E.164 format'),
  body('message')
    .isString()
    .isLength({ min, max: 1600 })
    .withMessage('Message must be between 1 and 1600 characters'),
  validateRequest,
];

/**
 * Validation for sending appointment notification
 */
const sendAppointmentNotificationValidation = [
  body('appointmentId')
    .isString()
    .withMessage('Appointment ID is required'),
  validateRequest,
];

/**
 * Get call logs for current tenant
 */
const getCallLogs = async (
  req,
  res,
  next) => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const { startDate, endDate, limit = '50', offset = '0' } = req.query;

    const where = { tenantId };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          throw new AppError('Invalid startDate format. Use ISO 8601 format.', 400);
        }
        where.startTime.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          throw new AppError('Invalid endDate format. Use ISO 8601 format.', 400);
        }
        where.startTime.lte = end;
      }
    }

    const callLogs = await prisma.callLog.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.callLog.count({ where });

    res.status(200).json({
      success,
      data: {
        callLogs,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notifications for current tenant
 */
const getNotifications = async (
  req,
  res,
  next) => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const { type, status, limit = '50', offset = '0' } = req.query;

    const where = { tenantId };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.notification.count({ where });

    res.status(200).json({
      success,
      data: {
        notifications,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send SMS to a customer
 */
const sendSMS = async (
  req,
  res,
  next) => {
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
      success,
      message: 'SMS sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send appointment confirmation SMS
 */
const sendAppointmentConfirmation = async (
  req,
  res,
  next) => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const { appointmentId } = req.body;

    await smsHandler.sendAppointmentConfirmation(tenantId, appointmentId);

    res.status(200).json({
      success,
      message: 'Appointment confirmation sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send appointment reminder SMS
 */
const sendAppointmentReminder = async (
  req,
  res,
  next) => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant ID not found in request', 400);
    }

    const { appointmentId } = req.body;

    await smsHandler.sendAppointmentReminder(tenantId, appointmentId);

    res.status(200).json({
      success,
      message: 'Appointment reminder sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tenant's phone number
 */
const getPhoneNumber = async (
  req,
  res,
  next) => {
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
      success,
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
const provisionPhoneNumber = async (
  req,
  res,
  next) => {
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
      success,
      data: {
        phoneNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendSMSValidation, sendAppointmentNotificationValidation, getCallLogs, getNotifications, sendSMS, sendAppointmentConfirmation, sendAppointmentReminder, getPhoneNumber, provisionPhoneNumber };
