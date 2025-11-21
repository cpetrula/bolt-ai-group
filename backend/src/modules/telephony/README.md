# Telephony Module

This module integrates Twilio for phone number provisioning, call handling, and SMS notifications.

## Features

### Phone Number Provisioning
- Automatic phone number assignment when tenant subscription becomes active
- Each tenant gets a unique Twilio phone number
- Phone numbers are stored in the `tenants.twilioPhoneNumber` field

### Incoming Call Handling
- Webhooks receive incoming calls from Twilio
- Calls are identified by tenant phone number
- Call logs are created with metadata (call SID, from/to numbers, duration)
- Basic AI greeting for callers
- Extendable to integrate with AI assistants (Vapi, OpenAI, etc.)

### SMS Handling
- Webhook receives incoming SMS messages
- Auto-reply functionality
- Message tracking in notifications table

### SMS Notifications
- Send SMS to customers (appointment confirmations, reminders)
- Send SMS to employees (new appointment notifications)
- Notification status tracking (queued, sent, failed)

### Call Logging
- Tracks all incoming calls with:
  - Call SID (Twilio identifier)
  - From/To phone numbers
  - Start/End times
  - Duration in seconds
  - Call reason (setup appointment, cancel, etc.)
  - Optional notes and recording URLs

## Environment Variables

Add these to your `.env` file:

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Database Schema

### call_logs Table
- `id` - UUID primary key
- `tenantId` - Foreign key to tenants
- `callSid` - Twilio call identifier
- `fromNumber` - Caller's phone number
- `toNumber` - Called number (tenant's Twilio number)
- `startTime` - Call start timestamp
- `endTime` - Call end timestamp (nullable)
- `durationSeconds` - Call duration in seconds (nullable)
- `callReason` - Enum: SETUP_APPOINTMENT, CANCEL_APPOINTMENT, MODIFY_APPOINTMENT, GET_HOURS, GET_PRICING, OTHER
- `notes` - Optional call notes/transcript
- `recordingUrl` - Optional URL to call recording

### notifications Table
- `id` - UUID primary key
- `tenantId` - Foreign key to tenants
- `type` - Enum: SMS, EMAIL
- `recipient` - Phone number or email address
- `message` - Message content
- `status` - Enum: QUEUED, SENT, FAILED
- `relatedAppointmentId` - Optional foreign key to appointments
- `sentAt` - Timestamp when sent (nullable)
- `failureReason` - Optional error message if failed

## API Endpoints

### Webhooks (No Authentication)

#### POST /api/webhooks/twilio/voice
Receives incoming voice calls from Twilio.

**Request Body** (from Twilio):
```
CallSid: string
From: string (caller's phone number)
To: string (called number)
```

**Response**: TwiML XML for voice response

#### POST /api/webhooks/twilio/voice/status
Receives call status updates from Twilio.

**Request Body** (from Twilio):
```
CallSid: string
CallStatus: string (completed, failed, no-answer)
CallDuration: string (seconds)
```

#### POST /api/webhooks/twilio/sms
Receives incoming SMS messages from Twilio.

**Request Body** (from Twilio):
```
MessageSid: string
From: string (sender's phone number)
To: string (recipient number)
Body: string (message text)
```

**Response**: TwiML XML for SMS response

### Protected Endpoints (Require Authentication)

#### GET /api/telephony/call-logs
Get call logs for the authenticated tenant.

**Query Parameters**:
- `startDate` - ISO 8601 date string (optional)
- `endDate` - ISO 8601 date string (optional)
- `limit` - Number of records (default: 50)
- `offset` - Number of records to skip (default: 0)

**Response**:
```json
{
  "success": true,
  "data": {
    "callLogs": [...],
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

#### GET /api/telephony/notifications
Get notifications for the authenticated tenant.

**Query Parameters**:
- `type` - Filter by type: SMS or EMAIL (optional)
- `status` - Filter by status: QUEUED, SENT, FAILED (optional)
- `limit` - Number of records (default: 50)
- `offset` - Number of records to skip (default: 0)

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

#### POST /api/telephony/sms
Send an SMS message to a customer.

**Request Body**:
```json
{
  "phoneNumber": "+1234567890",
  "message": "Your appointment is confirmed!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "SMS sent successfully"
}
```

#### POST /api/telephony/appointment-confirmation
Send appointment confirmation SMS.

**Request Body**:
```json
{
  "appointmentId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Appointment confirmation sent successfully"
}
```

#### POST /api/telephony/appointment-reminder
Send appointment reminder SMS.

**Request Body**:
```json
{
  "appointmentId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Appointment reminder sent successfully"
}
```

#### GET /api/telephony/phone-number
Get tenant's Twilio phone number.

**Response**:
```json
{
  "success": true,
  "data": {
    "phoneNumber": "+1234567890"
  }
}
```

#### POST /api/telephony/provision-phone
Provision a phone number for the tenant (if not already provisioned).

**Response**:
```json
{
  "success": true,
  "data": {
    "phoneNumber": "+1234567890"
  }
}
```

## Usage Examples

### Sending Appointment Confirmation

```typescript
import * as smsHandler from './modules/telephony/sms.handler';

// After creating an appointment
await smsHandler.sendAppointmentConfirmation(tenantId, appointmentId);
```

### Sending Custom SMS to Customer

```typescript
import * as smsHandler from './modules/telephony/sms.handler';

await smsHandler.sendCustomerNotification(
  tenantId,
  '+1234567890',
  'Thank you for your business!',
  appointmentId // optional
);
```

### Sending SMS to Employee

```typescript
import * as smsHandler from './modules/telephony/sms.handler';

await smsHandler.sendEmployeeNotification(
  tenantId,
  employeeId,
  'New appointment scheduled for tomorrow at 10 AM',
  appointmentId // optional
);
```

## Twilio Configuration

### Setting up Webhooks in Twilio Console

1. Log in to your Twilio Console
2. Navigate to Phone Numbers → Active Numbers
3. Select your phone number
4. Under Voice & Fax, configure:
   - **A CALL COMES IN**: Webhook → `https://yourdomain.com/api/webhooks/twilio/voice` → HTTP POST
   - **CALL STATUS CHANGES**: Webhook → `https://yourdomain.com/api/webhooks/twilio/voice/status` → HTTP POST
5. Under Messaging, configure:
   - **A MESSAGE COMES IN**: Webhook → `https://yourdomain.com/api/webhooks/twilio/sms` → HTTP POST

### Testing Webhooks Locally

Use ngrok to expose your local server:

```bash
ngrok http 3000
```

Then use the ngrok URL in Twilio webhook configuration:
```
https://your-ngrok-url.ngrok.io/api/webhooks/twilio/voice
```

## Future Enhancements

### AI Integration
The call handler is designed to be extended with AI assistant integration:
- Vapi for call orchestration
- OpenAI for natural language understanding
- ElevenLabs or OpenAI TTS for voice synthesis

### Advanced Features
- Call recording storage and playback
- Voicemail transcription
- Advanced call routing based on business hours
- Multi-language support
- SMS conversation threading
- Automated appointment reminders scheduled 24h before

## Security Considerations

### Webhook Signature Validation
Twilio signs all webhook requests. The `twilio.service.ts` includes a `validateTwilioSignature` function that can be used to verify webhook authenticity:

```typescript
import * as twilioService from './modules/telephony/twilio.service';

const isValid = twilioService.validateTwilioSignature(
  signature,
  url,
  params
);

if (!isValid) {
  throw new Error('Invalid Twilio signature');
}
```

### Rate Limiting
All protected endpoints use rate limiting middleware to prevent abuse.

### Tenant Isolation
All operations are scoped to the authenticated tenant to ensure data isolation.

## Troubleshooting

### Phone number not provisioning automatically
- Check that Twilio credentials are correctly configured in `.env`
- Verify subscription status is ACTIVE or TRIALING
- Check server logs for provisioning errors

### Webhooks not receiving calls
- Verify webhook URLs are configured in Twilio Console
- Ensure server is publicly accessible (use ngrok for local testing)
- Check that URLs use HTTPS in production

### SMS not sending
- Verify Twilio account has SMS capability
- Check that phone numbers are in E.164 format (+1234567890)
- Review Twilio logs in Console for delivery issues
- Ensure sufficient account balance

### Call logs not updating with duration
- Verify call status webhook is configured in Twilio
- Check that webhook URL is correct and accessible
