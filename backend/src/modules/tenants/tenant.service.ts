import { TenantStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import { CreateTenantData, UpdateTenantSettingsData, TenantSettings } from './tenant.model';
import { seedDefaultServices } from '../services/service.service';

/**
 * Create a new tenant
 */
export const createTenant = async (data: CreateTenantData) => {
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
      settings: settings ? (settings as Prisma.InputJsonValue) : undefined,
    },
    select: {
      id: true,
      name: true,
      businessType: true,
      status: true,
      settings: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Seed default services for salon business type
  if (businessType === 'salon') {
    try {
      await seedDefaultServices(tenant.id);
    } catch (error) {
      // Log error but don't fail tenant creation
      console.error('Failed to seed default services:', error);
    }
  }

  return tenant;
};

/**
 * Get tenant by ID
 */
export const getTenantById = async (tenantId: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      businessType: true,
      status: true,
      settings: true,
      createdAt: true,
      updatedAt: true,
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
export const getTenantSettings = async (tenantId: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      settings: true,
    },
  });

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  return tenant.settings as TenantSettings | null;
};

/**
 * Update tenant settings
 */
export const updateTenantSettings = async (
  tenantId: string,
  data: UpdateTenantSettingsData
) => {
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
      settings: settings as Prisma.InputJsonValue,
    },
    select: {
      id: true,
      name: true,
      businessType: true,
      status: true,
      settings: true,
      updatedAt: true,
    },
  });

  return updatedTenant;
};

/**
 * Update tenant status
 */
export const updateTenantStatus = async (
  tenantId: string,
  status: TenantStatus
) => {
  // Verify tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  // Validate status transition
  const validTransitions: Record<TenantStatus, TenantStatus[]> = {
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
      id: true,
      name: true,
      businessType: true,
      status: true,
      updatedAt: true,
    },
  });

  return updatedTenant;
};
