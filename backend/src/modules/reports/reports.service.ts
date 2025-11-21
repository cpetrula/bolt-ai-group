import { prisma } from '../../config/db';
import { CallLogReport, CallLogFilters } from './call-log.model';
import { AppointmentStatus } from '@prisma/client';

/**
 * Get call logs report for a tenant
 */
export const getCallLogsReport = async (
  tenantId: string,
  filters?: CallLogFilters
): Promise<CallLogReport> => {
  const whereClause: any = { tenantId };

  // Apply date filters if provided
  if (filters?.startDate || filters?.endDate) {
    whereClause.startTime = {};
    if (filters.startDate) {
      whereClause.startTime.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.startTime.lte = new Date(filters.endDate);
    }
  }

  // Get total count of calls
  const totalCalls = await prisma.callLog.count({
    where: whereClause,
  });

  // Get calls grouped by reason
  const callsByReason = await prisma.callLog.groupBy({
    by: ['callReason'],
    where: whereClause,
    _count: {
      callReason: true,
    },
  });

  return {
    totalCalls,
    callsByReason: callsByReason.map((item) => ({
      reason: item.callReason,
      count: item._count.callReason,
    })),
  };
};

/**
 * Get appointments report for a tenant
 */
export const getAppointmentsReport = async (
  tenantId: string,
  filters?: { startDate?: string; endDate?: string }
) => {
  const now = new Date();
  const whereClause: any = { tenantId };

  // Apply date filters if provided
  if (filters?.startDate || filters?.endDate) {
    whereClause.appointmentDate = {};
    if (filters.startDate) {
      whereClause.appointmentDate.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.appointmentDate.lte = new Date(filters.endDate);
    }
  }

  // Get upcoming appointments (scheduled/confirmed, future dates)
  const upcomingAppointments = await prisma.appointment.count({
    where: {
      ...whereClause,
      appointmentDate: {
        gte: whereClause.appointmentDate?.gte || now,
        ...(whereClause.appointmentDate?.lte && { lte: whereClause.appointmentDate.lte }),
      },
      status: {
        in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
      },
    },
  });

  // Get past appointments (completed, before today or end date)
  const pastAppointments = await prisma.appointment.count({
    where: {
      ...whereClause,
      appointmentDate: {
        ...(whereClause.appointmentDate?.gte && { gte: whereClause.appointmentDate.gte }),
        lte: whereClause.appointmentDate?.lte || now,
      },
      status: AppointmentStatus.COMPLETED,
    },
  });

  // Get cancelled appointments
  const cancelledAppointments = await prisma.appointment.count({
    where: {
      ...whereClause,
      status: AppointmentStatus.CANCELLED,
    },
  });

  // Get cancellation reasons breakdown
  const cancellationReasons = await prisma.appointment.findMany({
    where: {
      ...whereClause,
      status: AppointmentStatus.CANCELLED,
      cancellationReason: {
        not: null,
      },
    },
    select: {
      cancellationReason: true,
    },
  });

  // Group cancellation reasons
  const reasonsMap = new Map<string, number>();
  cancellationReasons.forEach((appointment) => {
    const reason = appointment.cancellationReason || 'No reason provided';
    reasonsMap.set(reason, (reasonsMap.get(reason) || 0) + 1);
  });

  const cancellationReasonsBreakdown = Array.from(reasonsMap.entries()).map(
    ([reason, count]) => ({
      reason,
      count,
    })
  );

  // Get no-show count
  const noShowAppointments = await prisma.appointment.count({
    where: {
      ...whereClause,
      status: AppointmentStatus.NO_SHOW,
    },
  });

  return {
    upcomingAppointments,
    pastAppointments,
    cancelledAppointments,
    noShowAppointments,
    cancellationReasons: cancellationReasonsBreakdown,
  };
};

/**
 * Get revenue report for a tenant
 */
export const getRevenueReport = async (
  tenantId: string,
  filters?: { startDate?: string; endDate?: string }
) => {
  const whereClause: any = {
    tenantId,
    status: AppointmentStatus.COMPLETED,
  };

  // Apply date filters if provided
  if (filters?.startDate || filters?.endDate) {
    whereClause.appointmentDate = {};
    if (filters.startDate) {
      whereClause.appointmentDate.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.appointmentDate.lte = new Date(filters.endDate);
    }
  }

  // Get all completed appointments with service details
  const completedAppointments = await prisma.appointment.findMany({
    where: whereClause,
    select: {
      totalPrice: true,
      service: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Calculate total revenue
  const totalRevenue = completedAppointments.reduce(
    (sum, appointment) => sum.add(appointment.totalPrice),
    new (require('@prisma/client').Prisma.Decimal)(0)
  );

  // Group revenue by service
  const revenueByServiceMap = new Map<
    string,
    { serviceName: string; revenue: any; count: number }
  >();

  completedAppointments.forEach((appointment) => {
    const serviceId = appointment.service.id;
    const serviceName = appointment.service.name;
    const existing = revenueByServiceMap.get(serviceId);

    if (existing) {
      existing.revenue = existing.revenue.add(appointment.totalPrice);
      existing.count += 1;
    } else {
      revenueByServiceMap.set(serviceId, {
        serviceName,
        revenue: appointment.totalPrice,
        count: 1,
      });
    }
  });

  const revenueByService = Array.from(revenueByServiceMap.values()).map(
    (item) => ({
      serviceName: item.serviceName,
      revenue: item.revenue.toNumber(),
      count: item.count,
    })
  );

  return {
    totalRevenue: totalRevenue.toNumber(),
    totalCompletedAppointments: completedAppointments.length,
    revenueByService,
  };
};
