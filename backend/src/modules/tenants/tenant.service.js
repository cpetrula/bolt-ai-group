const { TenantStatus, Prisma } = require('@prisma/client');
const { prisma } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { CreateTenantData, UpdateTenantSettingsData, TenantSettings } = require('./tenant.model');
const { seedDefaultServices } = require('../services/service.service');
const { logger } = require('../../utils/logger');

/**
 * Create a new tenant
 */
const createTenant = async (data) => {
  const { name, businessType = 'salon', settings } = data;

  // Check if tenant with same name already exists
  const existingTenant = await prisma.tenant.findFirst({
    where: { name },
  });

  if (existingTenant) {
    throw new AppError('Tenant with this name already exists', 409);
  }

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name,
      businessType,
      status: TenantStatus.TRIAL,
      settings: settings ? (settings.InputJsonValue) : undefined,
    },
    select: {
      id,
      name,
      businessType,
      status,
      settings,
      createdAt,
      updatedAt,
    },
  });

  // Seed default services for salon business type
  if (businessType === 'salon') {
    try {
      await seedDefaultServices(tenant.id);
    } catch (error) {
      // Log error but don't fail tenant creation
      logger.error('Failed to seed default services:', error);
    }
  }

  return tenant;
};

/**
 * Get tenant by ID
 */
const getTenantById = async (tenantId) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id,
      name,
      businessType,
      status,
      settings,
      createdAt,
      updatedAt,
    },
  });

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  return tenant;
};

/**
 * Get tenant settings
 */
const getTenantSettings = async (tenantId) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      settings,
    },
  });

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  return tenant.settings | null;
};

/**
 * Update tenant settings
 */
const updateTenantSettings = async (
  tenantId,
  data) => {
  const { settings } = data;

  // Verify tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  // Update tenant settings
  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      settings: settings.InputJsonValue,
    },
    select: {
      id,
      name,
      businessType,
      status,
      settings,
      updatedAt,
    },
  });

  return updatedTenant;
};

/**
 * Update tenant status
 */
const updateTenantStatus = async (
  tenantId,
  status) => {
  // Verify tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  // Validate status transition
  const validTransitions = {
    TRIAL: [TenantStatus.ACTIVE, TenantStatus.SUSPENDED],
    ACTIVE: [TenantStatus.INACTIVE, TenantStatus.SUSPENDED],
    INACTIVE: [TenantStatus.ACTIVE, TenantStatus.SUSPENDED],
    SUSPENDED: [TenantStatus.ACTIVE, TenantStatus.INACTIVE],
  };

  if (!validTransitions[tenant.status].includes(status)) {
    throw new AppError(
      `Invalid status transition from ${tenant.status} to ${status}`,
      400
    );
  }

  // Update tenant status
  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: { status },
    select: {
      id,
      name,
      businessType,
      status,
      updatedAt,
    },
  });

  return updatedTenant;
};

module.exports = { createTenant, getTenantById, getTenantSettings, updateTenantSettings, updateTenantStatus };
