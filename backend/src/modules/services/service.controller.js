const { Request, Response, NextFunction } = require('express');
const { body, validationResult } = require('express-validator');
const serviceService = require('./service.service');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Get all services for the tenant
 * GET /api/services
 */
const getServices = async (
  req,
  res,
  next) => {
  try {
    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const services = await serviceService.getServices(req.user.tenantId);

    res.status(200).json({
      success,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get service by ID
 * GET /api/services/:id
 */
const getServiceById = async (
  req,
  res,
  next) => {
  try {
    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    const service = await serviceService.getServiceById(
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
 * Create a new service
 * POST /api/services
 */
const createService = async (
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

    const service = await serviceService.createService(
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
 * Update a service
 * PATCH /api/services/:id
 */
const updateService = async (
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

    const service = await serviceService.updateService(
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
 * Delete a service
 * DELETE /api/services/:id
 */
const deleteService = async (
  req,
  res,
  next) => {
  try {
    if (!req.user?.tenantId) {
      throw new AppError('Tenant context required', 401);
    }

    await serviceService.deleteService(req.user.tenantId, req.params.id);

    res.status(200).json({
      success,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validation for creating a service
 */
const createServiceValidation = [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('description').optional().trim(),
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('durationMinutes')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('addons').optional().isArray().withMessage('Addons must be an array'),
  body('addons.*.name')
    .if(body('addons').exists())
    .notEmpty()
    .trim()
    .withMessage('Addon name is required'),
  body('addons.*.price')
    .if(body('addons').exists())
    .isFloat({ min: 0 })
    .withMessage('Addon price must be a positive number'),
  body('addons.*.durationMinutes')
    .if(body('addons').exists())
    .isInt({ min: 1 })
    .withMessage('Addon duration must be a positive integer'),
];

/**
 * Validation for updating a service
 */
const updateServiceValidation = [
  body('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
  body('description').optional().trim(),
  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('durationMinutes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

module.exports = { getServices, getServiceById, createService, updateService, deleteService, createServiceValidation, updateServiceValidation };
