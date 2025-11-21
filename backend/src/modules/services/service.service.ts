import { prisma } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import { CreateServiceData, UpdateServiceData } from './service.model';

/**
 * Get all services for a tenant
 */
export const getServices = async (tenantId: string) => {
  const services = await prisma.service.findMany({
    where: { tenantId },
    select: {
      id: true,
      tenantId: true,
      name: true,
      description: true,
      basePrice: true,
      durationMinutes: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      addons: {
        select: {
          id: true,
          tenantId: true,
          serviceId: true,
          name: true,
          price: true,
          durationMinutes: true,
          createdAt: true,
          updatedAt: true,
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
export const getServiceById = async (tenantId: string, serviceId: string) => {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      tenantId,
    },
    select: {
      id: true,
      tenantId: true,
      name: true,
      description: true,
      basePrice: true,
      durationMinutes: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      addons: {
        select: {
          id: true,
          tenantId: true,
          serviceId: true,
          name: true,
          price: true,
          durationMinutes: true,
          createdAt: true,
          updatedAt: true,
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
export const createService = async (
  tenantId: string,
  data: CreateServiceData
) => {
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
      id: true,
      tenantId: true,
      name: true,
      description: true,
      basePrice: true,
      durationMinutes: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      addons: {
        select: {
          id: true,
          tenantId: true,
          serviceId: true,
          name: true,
          price: true,
          durationMinutes: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return service;
};

/**
 * Update a service
 */
export const updateService = async (
  tenantId: string,
  serviceId: string,
  data: UpdateServiceData
) => {
  // Verify service exists and belongs to tenant
  await getServiceById(tenantId, serviceId);

  const service = await prisma.service.update({
    where: { id: serviceId },
    data: {
      name: data.name,
      description: data.description,
      basePrice: data.basePrice,
      durationMinutes: data.durationMinutes,
      isActive: data.isActive,
    },
    select: {
      id: true,
      tenantId: true,
      name: true,
      description: true,
      basePrice: true,
      durationMinutes: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      addons: {
        select: {
          id: true,
          tenantId: true,
          serviceId: true,
          name: true,
          price: true,
          durationMinutes: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return service;
};

/**
 * Delete a service
 */
export const deleteService = async (tenantId: string, serviceId: string) => {
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
export const seedDefaultServices = async (tenantId: string) => {
  const defaultServices = [
    {
      name: "Women's Haircut",
      description: 'Professional haircut for women',
      basePrice: 75,
      durationMinutes: 60,
      addons: [
        { name: 'Deep Conditioning Treatment', price: 30, durationMinutes: 20 },
        { name: 'Olaplex Treatment', price: 40, durationMinutes: 20 },
      ],
    },
    {
      name: "Men's Haircut",
      description: 'Professional haircut for men',
      basePrice: 50,
      durationMinutes: 45,
      addons: [
        { name: 'Beard Trim', price: 15, durationMinutes: 15 },
      ],
    },
    {
      name: "Kids' Haircut",
      description: 'Haircut for children under 12',
      basePrice: 40,
      durationMinutes: 45,
      addons: [],
    },
    {
      name: 'Blowout',
      description: 'Professional styling and blow dry',
      basePrice: 60,
      durationMinutes: 45,
      addons: [],
    },
    {
      name: 'Full Color',
      description: 'Complete hair coloring service',
      basePrice: 150,
      durationMinutes: 120,
      addons: [
        { name: 'Deep Conditioning Treatment', price: 30, durationMinutes: 20 },
        { name: 'Olaplex Treatment', price: 40, durationMinutes: 20 },
      ],
    },
    {
      name: 'Root Touch-Up',
      description: 'Root color touch-up service',
      basePrice: 95,
      durationMinutes: 90,
      addons: [
        { name: 'Deep Conditioning Treatment', price: 30, durationMinutes: 20 },
      ],
    },
    {
      name: 'Partial Highlights',
      description: 'Partial hair highlighting service',
      basePrice: 160,
      durationMinutes: 120,
      addons: [
        { name: 'Deep Conditioning Treatment', price: 30, durationMinutes: 20 },
        { name: 'Olaplex Treatment', price: 40, durationMinutes: 20 },
      ],
    },
    {
      name: 'Full Highlights',
      description: 'Full hair highlighting service',
      basePrice: 220,
      durationMinutes: 150,
      addons: [
        { name: 'Deep Conditioning Treatment', price: 30, durationMinutes: 20 },
        { name: 'Olaplex Treatment', price: 40, durationMinutes: 20 },
      ],
    },
  ];

  // Create all services with their addons
  const createdServices = await Promise.all(
    defaultServices.map((service) =>
      createService(tenantId, service)
    )
  );

  return createdServices;
};
