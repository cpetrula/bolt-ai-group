const { Request, Response, NextFunction } = require('express');
const { query, validationResult } = require('express-validator');
const reportsService = require('./reports.service');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Get call logs report
 * GET /api/reports/calls
 */
const getCallLogsReport = async (
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

    const filters = {
      startDate: req.query.startDate | undefined,
      endDate: req.query.endDate | undefined,
    };

    const report = await reportsService.getCallLogsReport(
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
 * Get appointments report
 * GET /api/reports/appointments
 */
const getAppointmentsReport = async (
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

    const filters = {
      startDate: req.query.startDate | undefined,
      endDate: req.query.endDate | undefined,
    };

    const report = await reportsService.getAppointmentsReport(
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
 * Get revenue report
 * GET /api/reports/revenue
 */
const getRevenueReport = async (
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

    const filters = {
      startDate: req.query.startDate | undefined,
      endDate: req.query.endDate | undefined,
    };

    const report = await reportsService.getRevenueReport(
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
 * Validation for date range filters
 */
const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
];

module.exports = { getCallLogsReport, getAppointmentsReport, getRevenueReport, dateRangeValidation };
