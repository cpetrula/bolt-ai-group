const { prisma } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { Decimal } = require('@prisma/client/runtime/library');

/**
 * Convert time string to minutes since midnight
 */
const timeToMinutes = (time) => {
  const parts = time.split(':');
  if (parts.length !== 2) {
    throw new Error(`Invalid time format: ${time}. Expected HH:MM format.`);
  }
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time values: ${time}. Hours must be 0-23 and minutes 0-59.`);
  }
  
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string
 */
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Add minutes to a time string
 */
const addMinutesToTime = (time, minutesToAdd) => {
  const totalMinutes = timeToMinutes(time) + minutesToAdd;
  return minutesToTime(totalMinutes);
};

/**
 * Check if two time ranges overlap
 */
const timeRangesOverlap = (
  start1,
  end1,
  start2,
  end2) => {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  return start1Min < end2Min && end1Min > start2Min;
};

/**
 * Calculate total duration and price of service including addons
 */
const calculateServiceTotals = async (
  tenantId,
  serviceId,
  addonIds
) => {
  // Get base service
  const service = await prisma.service.findFirst({
    where: {
      id,
      tenantId,
    },
    select: {
      basePrice,
      durationMinutes,
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
        id,
        price,
        durationMinutes,
      },
    });

    // Validate that all requested addons were found
    if (addons.length !== addonIds.length) {
      const foundIds = addons.map(a => a.id);
      const missingIds = addonIds.filter(id => !foundIds.includes(id));
      throw new AppError(
        `Invalid addon IDs: ${missingIds.join(', ')}. Addons not found or don't belong to this service.`,
        400
      );
    }

    totalDuration += addons.reduce((sum, addon) => sum + addon.durationMinutes, 0);
    totalPrice = addons.reduce((sum, addon) => sum.add(addon.price), totalPrice);
  }

  return { totalDuration, totalPrice };
};

/**
 * Configuration for time slot generation
 */
const TIME_SLOT_INTERVAL_MINUTES = 30; // Default time slot interval

/**
 * Type for appointment with time fields
 */

module.exports = { timeToMinutes, minutesToTime, addMinutesToTime, timeRangesOverlap, calculateServiceTotals, TIME_SLOT_INTERVAL_MINUTES };
