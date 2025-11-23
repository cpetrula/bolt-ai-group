const { openaiService } = require('./openai.service');
const appointmentService = require('../appointments/appointment.service');
const availabilityService = require('../appointments/availability.service');
const serviceService = require('../services/service.service');
const { prisma } = require('../../config/db');
const { logger } = require('../../utils/logger');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Intent Handler
 * Processes customer intents and executes appropriate actions
 */

/**
 * Handle check availability intent
 */
const handleCheckAvailability = async (
  context,
  entities
) => {
  try {
    const { tenantId } = context;

    // Extract required parameters
    const serviceId = entities.serviceId;
    const employeeId = entities.employeeId;
    const date = entities.date;

    if (!serviceId || !employeeId || !date) {
      return {
        success,
        message: 'I need to know which service, employee, and date you\'re interested in to check availability.',
      };
    }

    // Get availability
    const availability = await availabilityService.getAvailability(tenantId, {
      employeeId,
      serviceId,
      date,
      addonIds: entities.addonIds,
    });

    if (availability.length === 0) {
      return {
        success,
        message: 'Unfortunately, there are no available time slots for that date. Would you like to try a different date?',
        data: { slots: [] },
      };
    }

    const timeSlots = availability.map((slot) => slot.startTime).join(', ');
    
    return {
      success,
      message: `We have the following times available: ${timeSlots}. Which time works best for you?`,
      data: { slots: availability },
    };
  } catch (error) {
    logger.error('Error handling check availability intent:', error);
    return {
      success,
      message: 'I\'m having trouble checking availability right now. Please try again later.',
    };
  }
};

/**
 * Handle book appointment intent
 */
const handleBookAppointment = async (
  context,
  entities
) => {
  try {
    const { tenantId, customerName, customerPhone, customerEmail } = context;

    // Validate required fields
    if (!customerName || !customerPhone) {
      return {
        success,
        message: 'I need your name and phone number to book the appointment.',
      };
    }

    if (!entities.serviceId || !entities.employeeId || !entities.appointmentDate || !entities.startTime) {
      return {
        success,
        message: 'I need the service, employee, date, and time to book your appointment.',
      };
    }

    // Create appointment
    const appointment = await appointmentService.createAppointment(tenantId, {
      employeeId: entities.employeeId,
      serviceId: entities.serviceId,
      customerName,
      customerPhone,
      customerEmail,
      appointmentDate: entities.appointmentDate,
      startTime: entities.startTime,
      notes: entities.notes,
      addonIds: entities.addonIds || [],
    });

    return {
      success,
      message: `Great! I've booked your appointment for ${entities.appointmentDate} at ${entities.startTime}. You'll receive a confirmation shortly.`,
      data: { appointment },
    };
  } catch (error) {
    logger.error('Error handling book appointment intent:', error);
    
    if (error instanceof AppError) {
      return {
        success,
        message: error.message,
      };
    }
    
    return {
      success,
      message: 'I\'m having trouble booking that appointment. Please try again later.',
    };
  }
};

/**
 * Handle cancel appointment intent
 */
const handleCancelAppointment = async (
  context,
  entities
) => {
  try {
    const { tenantId, customerPhone } = context;

    if (!customerPhone) {
      return {
        success,
        message: 'I need your phone number to find your appointment.',
      };
    }

    // Find appointments by phone number
    const appointments = await appointmentService.getAppointments(tenantId, {});
    
    const customerAppointments = appointments.filter((apt) => 
      apt.customerPhone === customerPhone && 
      ['SCHEDULED', 'CONFIRMED'].includes(apt.status)
    );

    if (customerAppointments.length === 0) {
      return {
        success,
        message: 'I couldn\'t find any upcoming appointments for your phone number.',
      };
    }

    // If appointment ID is specified, cancel it
    if (entities.appointmentId) {
      const appointment = await appointmentService.cancelAppointment(
        tenantId,
        entities.appointmentId,
        { cancellationReason: entities.reason || 'Customer requested cancellation' }
      );

      return {
        success,
        message: 'Your appointment has been cancelled. Is there anything else I can help you with?',
        data: { appointment },
      };
    }

    // Otherwise, return list of appointments to cancel
    return {
      success,
      message: 'I found your upcoming appointments. Which one would you like to cancel?',
      data: { appointments: customerAppointments },
    };
  } catch (error) {
    logger.error('Error handling cancel appointment intent:', error);
    return {
      success,
      message: 'I\'m having trouble cancelling that appointment. Please try again later.',
    };
  }
};

/**
 * Handle ask services intent
 */
const handleAskServices = async (
  context,
  _entities
) => {
  try {
    const { tenantId } = context;

    const services = await serviceService.getServices(tenantId);
    
    const activeServices = services.filter((s) => s.isActive);

    if (activeServices.length === 0) {
      return {
        success,
        message: 'We don\'t have our service list available right now. Please call us directly for more information.',
        data: { services: [] },
      };
    }

    const serviceList = activeServices
      .map((s) => `${s.name} ($${s.basePrice}, ${s.durationMinutes} minutes)`)
      .join(', ');

    return {
      success,
      message: `We offer the following services: ${serviceList}. Which service are you interested in?`,
      data: { services: activeServices },
    };
  } catch (error) {
    logger.error('Error handling ask services intent:', error);
    return {
      success,
      message: 'I\'m having trouble retrieving our services right now. Please try again later.',
    };
  }
};

/**
 * Handle ask hours intent
 */
const handleAskHours = async (
  context,
  _entities
) => {
  try {
    const { tenantId } = context;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    const settings = tenant.settings;
    const businessHours = settings?.businessHours || {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed',
    };

    const hoursMessage = Object.entries(businessHours)
      .map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`)
      .join(', ');

    return {
      success,
      message: `Our business hours are: ${hoursMessage}. Would you like to book an appointment?`,
      data: { businessHours },
    };
  } catch (error) {
    logger.error('Error handling ask hours intent:', error);
    return {
      success,
      message: 'I\'m having trouble retrieving our business hours right now. Please try again later.',
    };
  }
};

/**
 * Main intent handler - routes to appropriate handler based on intent
 */
const handleIntent = async (
  intent,
  context,
  entities
) => {
  logger.info('Handling intent:', { intent, context, entities });

  switch (intent) {
    case 'check_availability':
      return handleCheckAvailability(context, entities);
    
    case 'book_appointment':
      return handleBookAppointment(context, entities);
    
    case 'cancel_appointment':
    case 'modify_appointment':
      return handleCancelAppointment(context, entities);
    
    case 'ask_services':
    case 'ask_pricing':
      return handleAskServices(context, entities);
    
    case 'ask_hours':
      return handleAskHours(context, entities);
    
    default:
      return {
        success,
        message: 'I\'m here to help with bookings, availability, services, and hours. What would you like to know?',
      };
  }
};

/**
 * Process user input and handle the detected intent
 */
const processUserInput = async (
  userInput,
  context) => {
  try {
    // Detect intent using OpenAI
    const intentResult = await openaiService.detectIntent(userInput, context);
    
    logger.info('Intent detected:', intentResult);

    // Handle the intent
    return await handleIntent(intentResult.intent, context, intentResult.entities || {});
  } catch (error) {
    logger.error('Error processing user input:', error);
    return {
      success,
      message: 'I\'m having trouble understanding that. Could you please rephrase?',
    };
  }
};

module.exports = { handleCheckAvailability, handleBookAppointment, handleCancelAppointment, handleAskServices, handleAskHours, handleIntent, processUserInput };
