import { prisma } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import { TimeSlot, AvailabilityQuery } from './appointment.model';
import {
  timeToMinutes,
  minutesToTime,
  addMinutesToTime,
  timeRangesOverlap,
  calculateServiceTotals,
  TIME_SLOT_INTERVAL_MINUTES,
} from './appointment.utils';


/**
 * Get employee's working schedule for a specific day
 */
const getEmployeeScheduleForDay = async (
  tenantId: string,
  employeeId: string,
  dayOfWeek: number
) => {
  const schedule = await prisma.employeeSchedule.findFirst({
    where: {
      tenantId,
      employeeId,
      dayOfWeek,
    },
  });

  return schedule;
};

/**
 * Get existing appointments for an employee on a specific date
 */
const getEmployeeAppointments = async (
  tenantId: string,
  employeeId: string,
  date: Date
) => {
  // Set the date to the start of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // Set the date to the end of the day
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      employeeId,
      appointmentDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        notIn: ['CANCELLED', 'NO_SHOW'],
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  return appointments;
};


/**
 * Generate time slots for a day based on employee schedule
 */
const generateTimeSlots = (
  startTime: string,
  endTime: string,
  slotDuration: number
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  for (let minutes = startMinutes; minutes + slotDuration <= endMinutes; minutes += TIME_SLOT_INTERVAL_MINUTES) {
    const slotStart = minutesToTime(minutes);
    const slotEnd = addMinutesToTime(slotStart, slotDuration);

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      available: true,
    });
  }

  return slots;
};

/**
 * Get available time slots for an employee on a specific date
 */
export const getAvailability = async (
  tenantId: string,
  query: AvailabilityQuery
): Promise<TimeSlot[]> => {
  const { employeeId, serviceId, date, addonIds } = query;

  // Parse the date
  const appointmentDate = new Date(date);
  if (isNaN(appointmentDate.getTime())) {
    throw new AppError('Invalid date format', 400);
  }

  // Get day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = appointmentDate.getDay();

  // Get employee's schedule for this day
  const schedule = await getEmployeeScheduleForDay(tenantId, employeeId, dayOfWeek);

  if (!schedule) {
    return []; // Employee doesn't work on this day
  }

  // Calculate total duration needed
  const { totalDuration } = await calculateServiceTotals(tenantId, serviceId, addonIds);

  // Generate all possible time slots
  const allSlots = generateTimeSlots(
    schedule.startTime,
    schedule.endTime,
    totalDuration
  );

  // Get existing appointments for this employee on this date
  const existingAppointments = await getEmployeeAppointments(
    tenantId,
    employeeId,
    appointmentDate
  );

  // Mark slots as unavailable if they conflict with existing appointments
  const availableSlots = allSlots.map((slot) => {
    const hasConflict = existingAppointments.some((appointment: any) =>
      timeRangesOverlap(slot.startTime, slot.endTime, appointment.startTime, appointment.endTime)
    );

    return {
      ...slot,
      available: !hasConflict,
    };
  });

  return availableSlots;
};

/**
 * Check if a specific time slot is available
 */
export const checkAvailability = async (
  tenantId: string,
  employeeId: string,
  serviceId: string,
  date: Date,
  startTime: string,
  addonIds?: string[]
): Promise<boolean> => {
  // Get day of week
  const dayOfWeek = date.getDay();

  // Get employee's schedule for this day
  const schedule = await getEmployeeScheduleForDay(tenantId, employeeId, dayOfWeek);

  if (!schedule) {
    return false; // Employee doesn't work on this day
  }

  // Calculate total duration needed
  const { totalDuration } = await calculateServiceTotals(tenantId, serviceId, addonIds);
  const endTime = addMinutesToTime(startTime, totalDuration);

  // Check if the time slot is within employee's working hours
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const scheduleStart = timeToMinutes(schedule.startTime);
  const scheduleEnd = timeToMinutes(schedule.endTime);

  if (startMinutes < scheduleStart || endMinutes > scheduleEnd) {
    return false; // Outside working hours
  }

  // Get existing appointments for this employee on this date
  const existingAppointments = await getEmployeeAppointments(
    tenantId,
    employeeId,
    date
  );

  // Check for conflicts with existing appointments
  const hasConflict = existingAppointments.some((appointment: any) =>
    timeRangesOverlap(startTime, endTime, appointment.startTime, appointment.endTime)
  );

  return !hasConflict;
};

/**
 * Calculate end time based on start time and duration
 */
export const calculateEndTime = async (
  tenantId: string,
  serviceId: string,
  startTime: string,
  addonIds?: string[]
): Promise<string> => {
  const { totalDuration } = await calculateServiceTotals(tenantId, serviceId, addonIds);
  return addMinutesToTime(startTime, totalDuration);
};
