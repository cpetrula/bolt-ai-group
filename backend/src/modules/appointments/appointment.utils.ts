import { prisma } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Convert time string to minutes since midnight
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Add minutes to a time string
 */
export const addMinutesToTime = (time: string, minutesToAdd: number): string => {
  const totalMinutes = timeToMinutes(time) + minutesToAdd;
  return minutesToTime(totalMinutes);
};

/**
 * Check if two time ranges overlap
 */
export const timeRangesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  return start1Min < end2Min && end1Min > start2Min;
};

/**
 * Calculate total duration and price of service including addons
 */
export const calculateServiceTotals = async (
  tenantId: string,
  serviceId: string,
  addonIds?: string[]
): Promise<{ totalDuration: number; totalPrice: Decimal }> => {
  // Get base service
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      tenantId,
    },
    select: {
      basePrice: true,
      durationMinutes: true,
    },
  });

  if (!service) {
    throw new AppError('Service not found', 404);
  }

  let totalDuration = service.durationMinutes;
  let totalPrice = service.basePrice;

  // Add addon durations and prices if provided
  if (addonIds && addonIds.length > 0) {
    const addons = await prisma.serviceAddon.findMany({
      where: {
        id: {
          in: addonIds,
        },
        tenantId,
        serviceId,
      },
      select: {
        price: true,
        durationMinutes: true,
      },
    });

    totalDuration += addons.reduce((sum, addon) => sum + addon.durationMinutes, 0);
    totalPrice = addons.reduce((sum, addon) => sum.add(addon.price), totalPrice);
  }

  return { totalDuration, totalPrice };
};

/**
 * Configuration for time slot generation
 */
export const TIME_SLOT_INTERVAL_MINUTES = 30; // Default time slot interval
