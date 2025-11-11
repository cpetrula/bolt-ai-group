import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn('Resend API key not configured. Set RESEND_API_KEY in .env');
}

export const resend = apiKey ? new Resend(apiKey) : null;

export default resend;
