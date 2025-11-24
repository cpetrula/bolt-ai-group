const { Request, Response } = require('express');
const { prisma } = require('../../config/db');
const { logger } = require('../../utils/logger');
const twilioService = require('./twilio.service');
const { vapiService } = require('../ai-assistant/vapi.service');
const { env } = require('../../config/env');
const { CallReason } = require('@prisma/client');

/**
 * Handle incoming voice calls from Twilio
 * This webhook receives call data and forwards to AI assistant
 */
const handleIncomingCall = async (
  req,
  res) => {
  try {
    // Validate Twilio signature for security
    const isValid = twilioService.validateTwilioRequest(req);

    if (!isValid) {
      logger.error('Invalid Twilio signature');
      res.status(403).send('Forbidden');
      return;
    }

    const {
      CallSid,
      From,
      To,
    } = req.method === 'POST' ? req.body : req.query;

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
    // In production, forward to Vapi AI assistant for intelligent call handling
    let twiml;
    
    // Check if Vapi is configured for production use
    if (vapiService.apiKey && vapiService.assistantId) {
      // Production mode: Connect call to Vapi for AI-powered conversation
      logger.info(`Connecting call to Vapi assistant ${vapiService.assistantId}`);
      twiml = generateVapiConnectTwiML(tenant, callLog);
    } else {
      // Fallback mode: Basic greeting when Vapi is not configured
      logger.warn('Vapi not configured, using fallback greeting');
      const greeting = `Hello and thank you for calling ${tenant.name}. This is your AI assistant. How may I help you today? You can ask about our services, pricing, hours, or to book an appointment.`;
      twiml = twilioService.generateVoiceResponse(greeting);
    }

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
const handleCallStatus = async (
  req,
  res) => {
  try {
    // Validate Twilio signature for security
    const isValid = twilioService.validateTwilioRequest(req);

    if (!isValid) {
      logger.error('Invalid Twilio signature');
      res.status(403).send('Forbidden');
      return;
    }

    const {
      CallSid,
      CallStatus,
      CallDuration,
    } = req.method === 'POST' ? req.body : req.query;

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
const updateCallLog = async (
  callSid,
  callReason,
  notes
) => {
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

/**
 * Generate TwiML to connect call to Vapi AI assistant
 * This uses Twilio's dial and SIP functionality to bridge the call to Vapi
 */
const generateVapiConnectTwiML = (tenant, callLog) => {
  const twilio = require('twilio');
  const twiml = new twilio.twiml.VoiceResponse();
  
  // Add a brief greeting before connecting to Vapi
  twiml.say(
    { voice: 'alice' },
    `Thank you for calling ${tenant.name}. Please hold while we connect you to our AI assistant.`
  );
  
  // Connect to Vapi using their Web endpoint
  // Vapi requires specific parameters to identify the assistant and pass call metadata
  const connect = twiml.connect();
  
  // Use Vapi's web stream for the connection
  // This establishes a WebSocket connection between Twilio and Vapi
  const stream = connect.stream({
    url: `wss://api.vapi.ai`,
  });
  
  // Pass metadata to Vapi about this call
  // This helps Vapi identify which assistant to use and provides context
  stream.parameter({
    name: 'assistantId',
    value: vapiService.assistantId,
  });
  
  stream.parameter({
    name: 'apiKey', 
    value: vapiService.apiKey,
  });
  
  // Pass tenant information for context
  stream.parameter({
    name: 'metadata',
    value: JSON.stringify({
      tenantId: tenant.id,
      tenantName: tenant.name,
      callLogId: callLog.id,
      callSid: callLog.callSid,
      // Provide the base URL for Vapi to call our APIs
      serverUrl: env.ngrokUrl || `http://localhost:${env.port}`,
    }),
  });
  
  return twiml.toString();
};

module.exports = { handleIncomingCall, handleCallStatus, updateCallLog };
