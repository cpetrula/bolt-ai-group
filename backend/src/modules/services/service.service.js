const { prisma } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { CreateServiceData, UpdateServiceData } = require('./service.model');

/**
 * Get all services for a tenant
 */
const getServices = async (tenantId) => {
  const services = await prisma.service.findMany({
    where: { tenantId },
    select: {
      id,
      tenantId,
      name,
      description,
      basePrice,
      durationMinutes,
      isActive,
      createdAt,
      updatedAt,
      addons: {
        select: {
          id,
          tenantId,
          serviceId,
          name,
          price,
          durationMinutes,
          createdAt,
          updatedAt,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return services;
};

/**
 * Get service by ID
 */
const getServiceById = async (tenantId, serviceId) => {
  const service = await prisma.service.findFirst({
    where: {
      id,
      tenantId,
    },
    select: {
      id,
      tenantId,
      name,
      description,
      basePrice,
      durationMinutes,
      isActive,
      createdAt,
      updatedAt,
      addons: {
        select: {
          id,
          tenantId,
          serviceId,
          name,
          price,
          durationMinutes,
          createdAt,
          updatedAt,
        },
      },
    },
  });

  if (!service) {
    throw new AppError('Service not found', 404);
  }

  return service;
};

/**
 * Create a new service
 */
const createService = async (
  tenantId,
  data) => {
  const {
    name,
    description,
    basePrice,
    durationMinutes,
    isActive = true,
    addons = [],
  } = data;

  const service = await prisma.service.create({
    data: {
      tenantId,
      name,
      description,
      basePrice,
      durationMinutes,
      isActive,
      addons: {
        create: addons.map((addon) => ({
          tenantId,
          name: addon.name,
          price: addon.price,
          durationMinutes: addon.durationMinutes,
        })),
      },
    },
    select: {
      id,
      tenantId,
      name,
      description,
      basePrice,
      durationMinutes,
      isActive,
      createdAt,
      updatedAt,
      addons: {
        select: {
          id,
          tenantId,
          serviceId,
          name,
          price,
          durationMinutes,
          createdAt,
          updatedAt,
        },
      },
    },
  });

  return service;
};

/**
 * Update a service
 */
const updateService = async (
  tenantId,
  serviceId,
  data) => {
  // Verify service exists and belongs to tenant
  await getServiceById(tenantId, serviceId);

  // Build update data object with only defined fields
  const updateData: Partial<{
    name: string;
    description: string | null;
    basePrice: number;
    durationMinutes: number;
    isActive: boolean;
  }> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
  if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const service = await prisma.service.update({
    where: { id: serviceId },
    data,
    select: {
      id,
      tenantId,
      name,
      description,
      basePrice,
      durationMinutes,
      isActive,
      createdAt,
      updatedAt,
      addons: {
        select: {
          id,
          tenantId,
          serviceId,
          name,
          price,
          durationMinutes,
          createdAt,
          updatedAt,
        },
      },
    },
  });

  return service;
};

/**
 * Delete a service
 */
const deleteService = async (tenantId, serviceId) => {
  // Verify service exists and belongs to tenant
  await getServiceById(tenantId, serviceId);

  await prisma.service.delete({
    where: { id: serviceId },
  });

  return { success: true };
};

/**
 * Seed default salon services for a tenant
 */
const seedDefaultServices = async (tenantId) => {
  const defaultServices = [
    {
      name: "Women's Haircut",
      description: 'Professional haircut for women',
      basePrice,
      durationMinutes,
      addons: [
        { name: 'Deep Conditioning Treatment', price, durationMinutes: 20 },
        { name: 'Olaplex Treatment', price, durationMinutes: 20 },
      ],
    },
    {
      name: "Men's Haircut",
      description: 'Professional haircut for men',
      basePrice,
      durationMinutes,
      addons: [
        { name: 'Beard Trim', price, durationMinutes: 15 },
      ],
    },
    {
      name: "Kids' Haircut",
      description: 'Haircut for children under 12',
      basePrice,
      durationMinutes,
      addons,
    },
    {
      name: 'Blowout',
      description: 'Professional styling and blow dry',
      basePrice,
      durationMinutes,
      addons,
    },
    {
      name: 'Full Color',
      description: 'Complete hair coloring service',
      basePrice,
      durationMinutes,
      addons: [
        { name: 'Deep Conditioning Treatment', price, durationMinutes: 20 },
        { name: 'Olaplex Treatment', price, durationMinutes: 20 },
      ],
    },
    {
      name: 'Root Touch-Up',
      description: 'Root color touch-up service',
      basePrice,
      durationMinutes,
      addons: [
        { name: 'Deep Conditioning Treatment', price, durationMinutes: 20 },
      ],
    },
    {
      name: 'Partial Highlights',
      description: 'Partial hair highlighting service',
      basePrice,
      durationMinutes,
      addons: [
        { name: 'Deep Conditioning Treatment', price, durationMinutes: 20 },
        { name: 'Olaplex Treatment', price, durationMinutes: 20 },
      ],
    },
    {
      name: 'Full Highlights',
      description: 'Full hair highlighting service',
      basePrice,
      durationMinutes,
      addons: [
        { name: 'Deep Conditioning Treatment', price, durationMinutes: 20 },
        { name: 'Olaplex Treatment', price, durationMinutes: 20 },
      ],
    },
  ];

  // Create all services sequentially to avoid database conflicts
  const createdServices = [];
  for (const service of defaultServices) {
    const created = await createService(tenantId, service);
    createdServices.push(created);
  }

  return createdServices;
};

module.exports = { getServices, getServiceById, createService, updateService, deleteService, seedDefaultServices };
