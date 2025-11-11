import resend from '../config/resend.js';
import { twilioClient, twilioPhone } from '../config/twilio.js';

// Send contact message via email (Resend) and SMS (Twilio)
export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Name, email, and message are required'
      });
    }

    const responses = {};

    // Send email via Resend if configured
    if (resend) {
      try {
        const emailData = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: process.env.CONTACT_EMAIL || email,
          subject: `New Contact Form Submission from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `
        });
        responses.email = { success: true, id: emailData.id };
      } catch (error) {
        console.error('Resend error:', error);
        responses.email = { success: false, error: error.message };
      }
    }

    // Send SMS via Twilio if configured and phone is provided
    if (twilioClient && twilioPhone && phone) {
      try {
        const smsData = await twilioClient.messages.create({
          body: `New contact from ${name} (${email}): ${message}`,
          from: twilioPhone,
          to: process.env.NOTIFICATION_PHONE || phone
        });
        responses.sms = { success: true, sid: smsData.sid };
      } catch (error) {
        console.error('Twilio error:', error);
        responses.sms = { success: false, error: error.message };
      }
    }

    res.json({ 
      success: true,
      message: 'Contact message received',
      responses
    });
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      message: error.message 
    });
  }
};
