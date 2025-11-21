import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { logger } from '../../utils/logger';
import * as twilioService from './twilio.service';
import { NotificationType, NotificationStatus } from '@prisma/client';

/**
 * Handle incoming SMS messages from Twilio
 */
export const handleIncomingSMS = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate Twilio signature for security
    const signature = req.headers['x-twilio-signature'] as string;
    if (!signature) {
      logger.error('Missing Twilio signature');
      res.status(403).send('Forbidden');
      return;
    }

    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const isValid = twilioService.validateTwilioSignature(
      signature,
      url,
      req.body
    );

    if (!isValid) {
      logger.error('Invalid Twilio signature');
      res.status(403).send('Forbidden');
      return;
    }

    const {
      MessageSid,
      From,
      To,
      Body,
    } = req.body;

    logger.info(`Incoming SMS: ${MessageSid} from ${From} to ${To}`);
    logger.info(`Message body: ${Body}`);

    // Identify tenant by phone number
    const tenant = await prisma.tenant.findFirst({
      where: { twilioPhoneNumber: To },
    });

    if (!tenant) {
      logger.error(`No tenant found for phone number: ${To}`);
      const twiml = twilioService.generateSMSResponse(
        'Sorry, this number is not currently in service.'
      );
      res.type('text/xml');
      res.send(twiml);
      return;
    }

    logger.info(`SMS received for tenant: ${tenant.name}`);

    // Process the SMS (in production, this would trigger AI processing)
    // For now, send an auto-reply
    const autoReply = `Thank you for contacting ${tenant.name}. We have received your message and will respond shortly. To book an appointment, please call us or visit our website.`;
    
    const twiml = twilioService.generateSMSResponse(autoReply);

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    logger.error('Error handling incoming SMS:', error);
    
    // Return error message
    const errorTwiml = twilioService.generateSMSResponse(
      'We are experiencing technical difficulties. Please try again later.'
    );
    res.type('text/xml');
    res.send(errorTwiml);
  }
};

/**
 * Send SMS notification to customer
 */
export const sendCustomerNotification = async (
  tenantId: string,
  phoneNumber: string,
  message: string,
  appointmentId?: string
): Promise<void> => {
  try {
    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        tenantId,
        type: NotificationType.SMS,
        recipient: phoneNumber,
        message,
        status: NotificationStatus.QUEUED,
        relatedAppointmentId: appointmentId,
      },
    });

    logger.info(`Customer notification created: ${notification.id}`);

    // Send SMS via Twilio
    try {
      const messageSid = await twilioService.sendSMS(phoneNumber, message);
      
      // Update notification status
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });
      
      logger.info(`Customer notification sent: ${messageSid}`);
    } catch (error) {
      // Update notification status to failed
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.FAILED,
          failureReason: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      
      throw error;
    }
  } catch (error) {
    logger.error('Error sending customer notification:', error);
    throw error;
  }
};

/**
 * Send SMS notification to employee
 */
export const sendEmployeeNotification = async (
  tenantId: string,
  employeeId: string,
  message: string,
  appointmentId?: string
): Promise<void> => {
  try {
    // Get employee details
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || !employee.phone) {
      throw new Error(`Employee ${employeeId} not found or has no phone number`);
    }

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        tenantId,
        type: NotificationType.SMS,
        recipient: employee.phone,
        message,
        status: NotificationStatus.QUEUED,
        relatedAppointmentId: appointmentId,
      },
    });

    logger.info(`Employee notification created: ${notification.id}`);

    // Send SMS via Twilio
    try {
      const messageSid = await twilioService.sendSMS(employee.phone, message);
      
      // Update notification status
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });
      
      logger.info(`Employee notification sent: ${messageSid}`);
    } catch (error) {
      // Update notification status to failed
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.FAILED,
          failureReason: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      
      throw error;
    }
  } catch (error) {
    logger.error('Error sending employee notification:', error);
    throw error;
  }
};

/**
 * Send appointment confirmation SMS
 */
export const sendAppointmentConfirmation = async (
  tenantId: string,
  appointmentId: string
): Promise<void> => {
  try {
    // Get appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        tenant: true,
        employee: true,
        service: true,
      },
    });

    if (!appointment || !appointment.customerPhone) {
      throw new Error('Appointment not found or customer has no phone number');
    }

    // Format date in a simple, clear format (MM/DD/YYYY)
    const month = appointment.appointmentDate.getMonth() + 1;
    const day = appointment.appointmentDate.getDate();
    const year = appointment.appointmentDate.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;

    const message = `Hi ${appointment.customerName}, your appointment at ${appointment.tenant.name} is confirmed for ${formattedDate} at ${appointment.startTime} with ${appointment.employee.name} for ${appointment.service.name}. See you then!`;

    await sendCustomerNotification(
      tenantId,
      appointment.customerPhone,
      message,
      appointmentId
    );
  } catch (error) {
    logger.error('Error sending appointment confirmation:', error);
    throw error;
  }
};

/**
 * Send appointment reminder SMS
 */
export const sendAppointmentReminder = async (
  tenantId: string,
  appointmentId: string
): Promise<void> => {
  try {
    // Get appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        tenant: true,
        service: true,
      },
    });

    if (!appointment || !appointment.customerPhone) {
      throw new Error('Appointment not found or customer has no phone number');
    }

    // Calculate time difference
    const now = new Date();
    const appointmentDateTime = new Date(appointment.appointmentDate);
    const hoursDiff = Math.floor((appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    let timeReference = 'soon';
    if (hoursDiff < 2) {
      timeReference = 'in less than 2 hours';
    } else if (hoursDiff < 24) {
      timeReference = 'today';
    } else if (hoursDiff < 48) {
      timeReference = 'tomorrow';
    } else {
      const daysDiff = Math.floor(hoursDiff / 24);
      timeReference = `in ${daysDiff} days`;
    }

    const message = `Reminder: You have an appointment at ${appointment.tenant.name} ${timeReference} at ${appointment.startTime} for ${appointment.service.name}. Reply CONFIRM to confirm or call us to reschedule.`;

    await sendCustomerNotification(
      tenantId,
      appointment.customerPhone,
      message,
      appointmentId
    );
  } catch (error) {
    logger.error('Error sending appointment reminder:', error);
    throw error;
  }
};
