import twilio from 'twilio';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';

/**
 * Twilio client instance
 */
const twilioClient = twilio(env.twilioAccountSid, env.twilioAuthToken);

/**
 * Provision a new phone number for a tenant
 * In production, this would search for available numbers and purchase one
 * For now, we'll use the configured Twilio number
 */
export const provisionPhoneNumber = async (
  tenantId: string,
  tenantName: string
): Promise<string> => {
  try {
    // In a production scenario, you would:
    // 1. Search for available phone numbers in the desired area code
    // 2. Purchase a phone number
    // 3. Configure webhook URLs for the number
    
    // For MVP, we'll use a shared number or simulate provisioning
    // const availableNumbers = await twilioClient.availablePhoneNumbers('US')
    //   .local
    //   .list({ limit: 1 });
    
    // if (availableNumbers.length === 0) {
    //   throw new AppError('No phone numbers available', 500);
    // }
    
    // const phoneNumber = await twilioClient.incomingPhoneNumbers.create({
    //   phoneNumber: availableNumbers[0].phoneNumber,
    //   voiceUrl: `${env.appUrl}/api/webhooks/twilio/voice`,
    //   smsUrl: `${env.appUrl}/api/webhooks/twilio/sms`,
    //   friendlyName: `${tenantName} - Salon Line`,
    // });
    
    logger.info(`Phone number provisioned for tenant ${tenantId}: ${tenantName}`);
    
    // Return the configured phone number for now
    // In production, return phoneNumber.phoneNumber
    return env.twilioPhoneNumber;
  } catch (error) {
    logger.error(`Error provisioning phone number for tenant ${tenantId}:`, error);
    throw new AppError('Failed to provision phone number', 500);
  }
};

/**
 * Send SMS message
 */
export const sendSMS = async (
  to: string,
  message: string
): Promise<string> => {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: env.twilioPhoneNumber,
      to: to,
    });
    
    logger.info(`SMS sent to ${to}: ${result.sid}`);
    return result.sid;
  } catch (error) {
    logger.error(`Error sending SMS to ${to}:`, error);
    throw new AppError('Failed to send SMS', 500);
  }
};

/**
 * Validate Twilio signature for webhook security
 */
export const validateTwilioSignature = (
  signature: string,
  url: string,
  params: Record<string, any>
): boolean => {
  try {
    return twilio.validateRequest(
      env.twilioAuthToken,
      signature,
      url,
      params
    );
  } catch (error) {
    logger.error('Error validating Twilio signature:', error);
    return false;
  }
};

/**
 * Generate TwiML response for voice calls
 */
export const generateVoiceResponse = (message: string): string => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say({ voice: 'alice' }, message);
  return twiml.toString();
};

/**
 * Generate TwiML response for SMS
 */
export const generateSMSResponse = (message: string): string => {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(message);
  return twiml.toString();
};

/**
 * Release phone number (when tenant cancels)
 */
export const releasePhoneNumber = async (phoneNumber: string): Promise<void> => {
  try {
    // In production, you would:
    // 1. Find the phone number resource
    // 2. Release/delete it
    
    // const numbers = await twilioClient.incomingPhoneNumbers.list({
    //   phoneNumber: phoneNumber,
    // });
    
    // if (numbers.length > 0) {
    //   await twilioClient.incomingPhoneNumbers(numbers[0].sid).remove();
    // }
    
    logger.info(`Phone number released: ${phoneNumber}`);
  } catch (error) {
    logger.error(`Error releasing phone number ${phoneNumber}:`, error);
    throw new AppError('Failed to release phone number', 500);
  }
};
