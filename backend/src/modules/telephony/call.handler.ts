import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { logger } from '../../utils/logger';
import * as twilioService from './twilio.service';
import { CallReason } from '@prisma/client';

/**
 * Handle incoming voice calls from Twilio
 * This webhook receives call data and forwards to AI assistant
 */
export const handleIncomingCall = async (
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
      CallSid,
      From,
      To,
    } = req.body;

    logger.info(`Incoming call: ${CallSid} from ${From} to ${To}`);

    // Identify tenant by phone number
    const tenant = await prisma.tenant.findFirst({
      where: { twilioPhoneNumber: To },
    });

    if (!tenant) {
      logger.error(`No tenant found for phone number: ${To}`);
      const twiml = twilioService.generateVoiceResponse(
        'Sorry, this number is not currently in service. Please check the number and try again.'
      );
      res.type('text/xml');
      res.send(twiml);
      return;
    }

    // Log the call start
    const callLog = await prisma.callLog.create({
      data: {
        tenantId: tenant.id,
        callSid: CallSid,
        fromNumber: From,
        toNumber: To,
        startTime: new Date(),
        callReason: CallReason.OTHER,
      },
    });

    logger.info(`Call log created: ${callLog.id} for tenant ${tenant.name}`);

    // Generate TwiML response
    // In production, this would forward to AI assistant (Vapi, OpenAI, etc.)
    // For now, we provide a basic greeting
    const greeting = `Hello and thank you for calling ${tenant.name}. This is your AI assistant. How may I help you today? You can ask about our services, pricing, hours, or to book an appointment.`;
    
    const twiml = twilioService.generateVoiceResponse(greeting);

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    logger.error('Error handling incoming call:', error);
    
    // Return error message to caller
    const errorTwiml = twilioService.generateVoiceResponse(
      'We are experiencing technical difficulties. Please try again later.'
    );
    res.type('text/xml');
    res.send(errorTwiml);
  }
};

/**
 * Handle call status updates from Twilio
 * Updates call logs with duration and end time
 */
export const handleCallStatus = async (
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
      CallSid,
      CallStatus,
      CallDuration,
    } = req.body;

    logger.info(`Call status update: ${CallSid} - ${CallStatus}`);

    // Update call log if call has completed
    if (CallStatus === 'completed' || CallStatus === 'failed' || CallStatus === 'no-answer') {
      const callLog = await prisma.callLog.findFirst({
        where: { callSid: CallSid },
      });

      if (callLog) {
        await prisma.callLog.update({
          where: { id: callLog.id },
          data: {
            endTime: new Date(),
            durationSeconds: CallDuration ? parseInt(CallDuration) : null,
          },
        });
        
        logger.info(`Call log updated: ${callLog.id} - Duration: ${CallDuration}s`);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    logger.error('Error handling call status:', error);
    res.sendStatus(500);
  }
};

/**
 * Update call log with AI interaction details
 * Called by AI assistant when processing call intents
 */
export const updateCallLog = async (
  callSid: string,
  callReason: CallReason,
  notes?: string
): Promise<void> => {
  try {
    const callLog = await prisma.callLog.findFirst({
      where: { callSid },
    });

    if (callLog) {
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          callReason,
          notes,
        },
      });
      
      logger.info(`Call log updated with reason: ${callReason}`);
    }
  } catch (error) {
    logger.error('Error updating call log:', error);
    throw error;
  }
};
