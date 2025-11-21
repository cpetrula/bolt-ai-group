import { prisma } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import {
  CreateAppointmentData,
  UpdateAppointmentData,
  CancelAppointmentData,
  AppointmentStatus,
} from './appointment.model';
import {
  checkAvailability,
  calculateEndTime,
} from './availability.service';
import {
  timeToMinutes,
  calculateServiceTotals,
} from './appointment.utils';


/**
 * Get all appointments for a tenant
 */
export const getAppointments = async (
  tenantId: string,
  filters?: {
    employeeId?: string;
    status?: AppointmentStatus;
    startDate?: string;
    endDate?: string;
  }
) => {
  const whereClause: any = { tenantId };

  if (filters?.employeeId) {
    whereClause.employeeId = filters.employeeId;
  }

  if (filters?.status) {
    whereClause.status = filters.status;
  }

  if (filters?.startDate || filters?.endDate) {
    whereClause.appointmentDate = {};
    if (filters.startDate) {
      whereClause.appointmentDate.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.appointmentDate.lte = new Date(filters.endDate);
    }
  }

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      service: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          durationMinutes: true,
        },
      },
      addons: true,
    },
    orderBy: [
      { appointmentDate: 'asc' },
      { startTime: 'asc' },
    ],
  });

  return appointments;
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (tenantId: string, appointmentId: string) => {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      tenantId,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      service: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          durationMinutes: true,
        },
      },
      addons: true,
    },
  });

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  return appointment;
};

/**
 * Create a new appointment
 */
export const createAppointment = async (
  tenantId: string,
  data: CreateAppointmentData
) => {
  const {
    employeeId,
    serviceId,
    customerName,
    customerEmail,
    customerPhone,
    appointmentDate,
    startTime,
    notes,
    addonIds,
  } = data;

  // Parse and validate appointment date
  const parsedDate = new Date(appointmentDate);
  if (isNaN(parsedDate.getTime())) {
    throw new AppError('Invalid appointment date', 400);
  }

  // Verify employee exists and is active
  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,
      tenantId,
      isActive: true,
    },
  });

  if (!employee) {
    throw new AppError('Employee not found or inactive', 404);
  }

  // Verify service exists and is active
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      tenantId,
      isActive: true,
    },
  });

  if (!service) {
    throw new AppError('Service not found or inactive', 404);
  }

  // Verify employee can provide this service
  const employeeService = await prisma.employeeService.findFirst({
    where: {
      employeeId,
      serviceId,
      tenantId,
    },
  });

  if (!employeeService) {
    throw new AppError('Employee cannot provide this service', 400);
  }

  // Calculate end time based on service and addons
  const endTime = await calculateEndTime(tenantId, serviceId, startTime, addonIds);

  // Check availability (prevent double-booking)
  const isAvailable = await checkAvailability(
    tenantId,
    employeeId,
    serviceId,
    parsedDate,
    startTime,
    addonIds
  );

  if (!isAvailable) {
    throw new AppError('Time slot not available', 409);
  }

  // Calculate total price and duration
  const { totalPrice, totalDuration } = await calculateServiceTotals(tenantId, serviceId, addonIds);

  // Create appointment with addons in a transaction
  const appointment = await prisma.$transaction(async (tx) => {
    // Create the appointment
    const newAppointment = await tx.appointment.create({
      data: {
        tenantId,
        employeeId,
        serviceId,
        customerName,
        customerEmail,
        customerPhone,
        appointmentDate: parsedDate,
        startTime,
        endTime,
        totalPrice,
        totalDuration,
        notes,
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            durationMinutes: true,
          },
        },
      },
    });

    // Add addons if provided
    if (addonIds && addonIds.length > 0) {
      const addons = await tx.serviceAddon.findMany({
        where: {
          id: {
            in: addonIds,
          },
          tenantId,
          serviceId,
        },
      });

      await tx.appointmentAddon.createMany({
        data: addons.map((addon) => ({
          tenantId,
          appointmentId: newAppointment.id,
          addonId: addon.id,
          name: addon.name,
          price: addon.price,
          durationMinutes: addon.durationMinutes,
        })),
      });
    }

    return newAppointment;
  });

  // Fetch the complete appointment with addons
  return getAppointmentById(tenantId, appointment.id);
};

/**
 * Update an appointment
 */
export const updateAppointment = async (
  tenantId: string,
  appointmentId: string,
  data: UpdateAppointmentData
) => {
  // Verify appointment exists and belongs to tenant
  const existingAppointment = await getAppointmentById(tenantId, appointmentId);

  // Check if appointment can be modified
  if (existingAppointment.status === AppointmentStatus.CANCELLED) {
    throw new AppError('Cannot modify a cancelled appointment', 400);
  }

  if (existingAppointment.status === AppointmentStatus.COMPLETED) {
    throw new AppError('Cannot modify a completed appointment', 400);
  }

  const {
    employeeId,
    serviceId,
    appointmentDate,
    startTime,
    addonIds,
    ...otherData
  } = data;

  // If rescheduling, check availability
  if (employeeId || serviceId || appointmentDate || startTime || addonIds) {
    const newEmployeeId = employeeId || existingAppointment.employeeId;
    const newServiceId = serviceId || existingAppointment.serviceId;
    const newDate = appointmentDate
      ? new Date(appointmentDate)
      : existingAppointment.appointmentDate;
    const newStartTime = startTime || existingAppointment.startTime;
    const newAddonIds = addonIds !== undefined ? addonIds : existingAppointment.addons.map((a: any) => a.addonId);

    // Verify employee can provide the service if changed
    if (employeeId || serviceId) {
      const employeeService = await prisma.employeeService.findFirst({
        where: {
          employeeId: newEmployeeId,
          serviceId: newServiceId,
          tenantId,
        },
      });

      if (!employeeService) {
        throw new AppError('Employee cannot provide this service', 400);
      }
    }

    // Calculate new end time
    const newEndTime = await calculateEndTime(
      tenantId,
      newServiceId,
      newStartTime,
      newAddonIds
    );

    // Check availability (excluding the current appointment)
    const isAvailable = await checkAvailabilityExcludingAppointment(
      tenantId,
      newEmployeeId,
      newServiceId,
      newDate,
      newStartTime,
      appointmentId,
      newAddonIds
    );

    if (!isAvailable) {
      throw new AppError('Time slot not available', 409);
    }

    // Calculate new price and duration
    const { totalPrice, totalDuration } = await calculateServiceTotals(tenantId, newServiceId, newAddonIds);

    // Update appointment with new addons in a transaction
    await prisma.$transaction(async (tx) => {
      // Update the appointment
      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          ...otherData,
          ...(employeeId && { employeeId }),
          ...(serviceId && { serviceId }),
          ...(appointmentDate && { appointmentDate: newDate }),
          ...(startTime && { startTime: newStartTime }),
          endTime: newEndTime,
          totalPrice,
          totalDuration,
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              basePrice: true,
              durationMinutes: true,
            },
          },
        },
      });

      // Update addons if provided
      if (addonIds !== undefined) {
        // Delete existing addons
        await tx.appointmentAddon.deleteMany({
          where: { appointmentId },
        });

        // Add new addons
        if (newAddonIds.length > 0) {
          const addons = await tx.serviceAddon.findMany({
            where: {
              id: {
                in: newAddonIds,
              },
              tenantId,
              serviceId: newServiceId,
            },
          });

          await tx.appointmentAddon.createMany({
            data: addons.map((addon) => ({
              tenantId,
              appointmentId,
              addonId: addon.id,
              name: addon.name,
              price: addon.price,
              durationMinutes: addon.durationMinutes,
            })),
          });
        }
      }
    });

    return getAppointmentById(tenantId, appointmentId);
  }

  // Simple update without rescheduling
  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: otherData,
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      service: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          durationMinutes: true,
        },
      },
      addons: true,
    },
  });

  return appointment;
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (
  tenantId: string,
  appointmentId: string,
  data: CancelAppointmentData
) => {
  // Verify appointment exists and belongs to tenant
  const existingAppointment = await getAppointmentById(tenantId, appointmentId);

  if (existingAppointment.status === AppointmentStatus.CANCELLED) {
    throw new AppError('Appointment is already cancelled', 400);
  }

  if (existingAppointment.status === AppointmentStatus.COMPLETED) {
    throw new AppError('Cannot cancel a completed appointment', 400);
  }

  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: AppointmentStatus.CANCELLED,
      cancellationReason: data.cancellationReason,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      service: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          durationMinutes: true,
        },
      },
      addons: true,
    },
  });

  return appointment;
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (tenantId: string, appointmentId: string) => {
  // Verify appointment exists and belongs to tenant
  await getAppointmentById(tenantId, appointmentId);

  await prisma.appointment.delete({
    where: { id: appointmentId },
  });

  return { success: true };
};

/**
 * Helper function to check availability excluding a specific appointment
 * Used when rescheduling an existing appointment
 */
const checkAvailabilityExcludingAppointment = async (
  tenantId: string,
  employeeId: string,
  serviceId: string,
  date: Date,
  startTime: string,
  excludeAppointmentId: string,
  addonIds?: string[]
): Promise<boolean> => {
  // Get day of week
  const dayOfWeek = date.getDay();

  // Get employee's schedule for this day
  const schedule = await prisma.employeeSchedule.findFirst({
    where: {
      tenantId,
      employeeId,
      dayOfWeek,
    },
  });

  if (!schedule) {
    return false;
  }

  // Calculate end time
  const endTime = await calculateEndTime(tenantId, serviceId, startTime, addonIds);

  // Check if within working hours
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const scheduleStart = timeToMinutes(schedule.startTime);
  const scheduleEnd = timeToMinutes(schedule.endTime);

  if (startMinutes < scheduleStart || endMinutes > scheduleEnd) {
    return false;
  }

  // Get existing appointments excluding the one being updated
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
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
      id: {
        not: excludeAppointmentId,
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  // Check for conflicts
  const hasConflict = existingAppointments.some((appointment: any) => {
    const appStart = timeToMinutes(appointment.startTime);
    const appEnd = timeToMinutes(appointment.endTime);
    return startMinutes < appEnd && endMinutes > appStart;
  });

  return !hasConflict;
};
