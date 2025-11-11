import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken) {
  console.warn('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
}

export const twilioClient = accountSid && authToken 
  ? twilio(accountSid, authToken)
  : null;

export const twilioPhone = phoneNumber;

export default { twilioClient, twilioPhone };
