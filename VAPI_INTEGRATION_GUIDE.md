# Vapi Integration Guide

## Overview

This guide explains how the Bolt AI Group application integrates with Vapi to handle incoming phone calls with AI-powered conversation capabilities.

## How the Integration Works

### High-Level Flow

```
1. Customer calls Twilio number
2. Twilio sends webhook to our backend (/api/webhooks/twilio/voice)
3. Backend identifies tenant and creates call log
4. Backend generates TwiML that connects call to Vapi
5. Vapi handles the AI conversation (speech-to-text, AI processing, text-to-speech)
6. Vapi calls our backend APIs to perform actions (book appointments, check availability, etc.)
7. Call ends, Vapi sends webhook with call summary
```

### Detailed Architecture

```
┌─────────────────┐
│    Customer     │
│   Phone Call    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│            Twilio (Telephony)               │
│  - Receives incoming call                   │
│  - Sends webhook to backend                 │
│  - Receives TwiML response                  │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│         Backend (call.handler.js)           │
│  1. Validates Twilio signature              │
│  2. Identifies tenant by phone number       │
│  3. Creates call log in database            │
│  4. Generates TwiML with Vapi connection    │
└────────┬────────────────────────────────────┘
         │
         ▼ (TwiML with <Connect><Stream>)
┌─────────────────────────────────────────────┐
│            Vapi (AI Platform)               │
│  - Receives audio stream from Twilio        │
│  - Performs speech-to-text                  │
│  - Processes with GPT-4/LLM                 │
│  - Generates response                       │
│  - Performs text-to-speech                  │
│  - Calls backend APIs for actions           │
└────────┬────────────────────────────────────┘
         │
         ▼ (API calls for actions)
┌─────────────────────────────────────────────┐
│         Backend API Endpoints               │
│  - POST /api/ai/availability                │
│  - POST /api/ai/appointments                │
│  - POST /api/ai/services                    │
│  - POST /api/ai/process                     │
└─────────────────────────────────────────────┘
```

## Setting Up Vapi

### Prerequisites

1. **Vapi Account**: Sign up at [https://vapi.ai](https://vapi.ai)
2. **Vapi API Key**: Get from [https://dashboard.vapi.ai/account](https://dashboard.vapi.ai/account)
3. **Ngrok or Public URL**: Your backend must be publicly accessible for webhooks

### Step 1: Create a Vapi Assistant

In the Vapi dashboard, create a new assistant with the following configuration:

#### Basic Settings

```json
{
  "name": "Salon Booking Assistant",
  "firstMessage": "Hello! Thank you for calling. I'm here to help you book an appointment or answer any questions. How may I assist you today?",
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 250
  },
  "voice": {
    "provider": "playht",
    "voiceId": "jennifer"
  }
}
```

#### System Prompt

Set up the assistant's system prompt to define its behavior:

```
You are a professional AI assistant for a hair salon. Your role is to:

1. Greet callers warmly and professionally
2. Help customers book, modify, or cancel appointments
3. Answer questions about services, pricing, and business hours
4. Collect necessary information (name, phone, preferred date/time, service)
5. Confirm all details before finalizing appointments

Guidelines:
- Be friendly, patient, and professional
- Keep responses concise and clear
- Always confirm important details (date, time, service, customer name)
- If unsure about something, ask clarifying questions
- Use the available tools to check availability and book appointments
- End calls politely and ensure customer satisfaction

Available services include haircuts, color treatments, highlights, and blowouts.
```

### Step 2: Configure Tools/Functions

Vapi assistants can call external APIs. Configure these tools in your assistant:

#### Tool 1: Check Availability

```json
{
  "type": "function",
  "function": {
    "name": "check_availability",
    "description": "Check available appointment time slots for a specific date, employee, and service",
    "parameters": {
      "type": "object",
      "properties": {
        "tenantId": {
          "type": "string",
          "description": "The tenant/salon ID (from call metadata)"
        },
        "serviceId": {
          "type": "string",
          "description": "The ID of the service requested"
        },
        "employeeId": {
          "type": "string",
          "description": "The ID of the preferred employee (optional)"
        },
        "date": {
          "type": "string",
          "description": "The date to check availability (YYYY-MM-DD format)"
        },
        "addonIds": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Optional array of addon service IDs"
        }
      },
      "required": ["tenantId", "serviceId", "date"]
    },
    "url": "{serverUrl}/api/ai/availability",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    }
  }
}
```

#### Tool 2: Book Appointment

```json
{
  "type": "function",
  "function": {
    "name": "book_appointment",
    "description": "Create a new appointment for a customer",
    "parameters": {
      "type": "object",
      "properties": {
        "action": {
          "type": "string",
          "enum": ["create"],
          "description": "The action to perform"
        },
        "tenantId": {
          "type": "string",
          "description": "The tenant/salon ID"
        },
        "employeeId": {
          "type": "string",
          "description": "The employee/stylist ID"
        },
        "serviceId": {
          "type": "string",
          "description": "The service ID"
        },
        "customerName": {
          "type": "string",
          "description": "Customer's full name"
        },
        "customerPhone": {
          "type": "string",
          "description": "Customer's phone number"
        },
        "customerEmail": {
          "type": "string",
          "description": "Customer's email (optional)"
        },
        "appointmentDate": {
          "type": "string",
          "description": "Appointment date (YYYY-MM-DD)"
        },
        "startTime": {
          "type": "string",
          "description": "Start time (HH:MM in 24-hour format)"
        },
        "notes": {
          "type": "string",
          "description": "Additional notes"
        },
        "addonIds": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Optional addon service IDs"
        }
      },
      "required": ["action", "tenantId", "employeeId", "serviceId", "customerName", "customerPhone", "appointmentDate", "startTime"]
    },
    "url": "{serverUrl}/api/ai/appointments",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    }
  }
}
```

#### Tool 3: Get Services

```json
{
  "type": "function",
  "function": {
    "name": "get_services",
    "description": "Get information about available services and pricing",
    "parameters": {
      "type": "object",
      "properties": {
        "tenantId": {
          "type": "string",
          "description": "The tenant/salon ID"
        },
        "serviceId": {
          "type": "string",
          "description": "Optional specific service ID to get details for"
        }
      },
      "required": ["tenantId"]
    },
    "url": "{serverUrl}/api/ai/services",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    }
  }
}
```

### Step 3: Configure Webhooks

Set up webhooks in your Vapi assistant to receive call events:

1. Go to your assistant settings in Vapi dashboard
2. Navigate to "Webhooks" section
3. Add webhook URL: `{YOUR_NGROK_URL}/api/ai/webhooks/vapi`
4. Select events to receive:
   - `call.started` - When call begins
   - `call.ended` - When call completes
   - `function.called` - When assistant calls a tool
   - `message.received` - When customer speaks
   - `message.sent` - When assistant responds

### Step 4: Environment Configuration

Add these environment variables to your `.env` file:

```env
# Vapi Configuration
VAPI_API_KEY=your_vapi_api_key_here
VAPI_ASSISTANT_ID=your_vapi_assistant_id_here
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id_here  # Optional

# Your public URL (required for Vapi to call your APIs)
NGROK_URL=https://your-ngrok-url.ngrok-free.app
```

**Note about VAPI_PHONE_NUMBER_ID**: This is optional. If you have a phone number configured in Vapi and want to associate it with incoming calls, set this value. Otherwise, Vapi will use the assistant ID to handle calls.

### Step 5: Update Twilio Webhook

Configure your Twilio phone number to point to your backend:

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to Phone Numbers → Active Numbers
3. Select your phone number
4. Under "Voice & Fax", set:
   - **When a call comes in**: Webhook
   - **URL**: `{YOUR_NGROK_URL}/api/webhooks/twilio/voice`
   - **HTTP Method**: POST
5. Under "Status Callback URL": `{YOUR_NGROK_URL}/api/webhooks/twilio/voice/status`

## How the Code Works

### In `call.handler.js`

When a call comes in, the `handleIncomingCall` function:

1. **Validates the Twilio signature** to ensure the request is authentic
2. **Identifies the tenant** by matching the `To` phone number with the database
3. **Creates a call log** to track the call
4. **Checks if Vapi is configured** (API key and Assistant ID present)
5. **Creates a Vapi inbound call**:
   - If Vapi is configured: Calls `vapiService.createInboundCall()` which uses Vapi's phone call provider bypass
   - Vapi returns TwiML with a call-specific WebSocket URL
   - If Vapi is not configured: Returns simple greeting (fallback mode)

### How Phone Call Provider Bypass Works

The implementation uses Vapi's **Phone Call Provider Bypass** approach:

1. Backend calls Vapi's API: `POST https://api.vapi.ai/call`
2. Payload includes:
   ```javascript
   {
     assistantId: 'your-assistant-id',
     phoneCallProviderBypassEnabled: true,
     customer: { number: callerPhoneNumber },
     phoneNumberId: 'optional-phone-number-id',  // Optional
     metadata: { tenantId, callLogId },           // Optional
     assistantOverrides: {
       variableValues: {
         businessName: 'Salon Name'
       }
     }
   }
   ```
3. Vapi creates a call and returns a response with TwiML
4. Backend returns this TwiML to Twilio

### TwiML Structure

The TwiML returned by Vapi contains a call-specific WebSocket URL:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://api.vapi.ai/{unique-call-id}/transport">
      <!-- Vapi manages parameters internally -->
    </Stream>
  </Connect>
</Response>
```

### Key Components

- **`<Connect>`**: Connects the call to an external service
- **`<Stream>`**: Establishes WebSocket connection to Vapi
- **URL**: Call-specific WebSocket URL generated by Vapi (not static)
- **Parameters**: Managed internally by Vapi based on the API call payload

## Authentication & Security

### API Authentication

The backend APIs that Vapi calls require JWT authentication. You have two options:

#### Option 1: Use a Service Account Token (Recommended)

Create a long-lived JWT token for Vapi to use:

1. Create a service account user in your database
2. Generate a JWT token with long expiration (e.g., 1 year)
3. Configure Vapi to send this token in the Authorization header
4. Add to Vapi tool configuration:

```json
{
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_SERVICE_ACCOUNT_JWT"
  }
}
```

#### Option 2: Modify Middleware for Vapi Requests

Update your auth middleware to allow requests from Vapi:

```javascript
// In auth middleware
if (req.path.startsWith('/api/ai/') && req.body.metadata?.vapiCallId) {
  // Allow Vapi requests without JWT
  // Extract tenant info from metadata instead
  req.user = { tenantId: req.body.metadata.tenantId };
  return next();
}
```

### Webhook Signature Validation

For production, implement webhook signature validation:

```javascript
// In ai.controller.js handleVapiWebhook
const crypto = require('crypto');

function validateVapiSignature(req) {
  const signature = req.headers['x-vapi-signature'];
  const payload = JSON.stringify(req.body);
  const secret = env.vapiWebhookSecret;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}
```

## Testing the Integration

### 1. Test Without Vapi (Fallback Mode)

Don't set `VAPI_API_KEY` or `VAPI_ASSISTANT_ID` in your `.env`:

```bash
# Start ngrok
./start-ngrok.sh

# Start backend
cd backend
npm run dev

# Call your Twilio number
# You should hear the fallback greeting
```

### 2. Test With Vapi

Set up Vapi credentials:

```env
VAPI_API_KEY=sk_live_xxxxx
VAPI_ASSISTANT_ID=assistant_xxxxx
NGROK_URL=https://your-ngrok.ngrok-free.app
```

Restart your backend and call the number. You should:
1. Hear the brief connecting message
2. Be connected to Vapi
3. Hear Vapi's greeting
4. Be able to interact with the AI assistant

### 3. Monitor Logs

Watch the backend logs:

```bash
cd backend
npm run dev
```

Look for:
- `Connecting call to Vapi assistant assistant_xxxxx`
- Webhook events from Vapi
- API calls made by Vapi

### 4. Test Booking Flow

Call your number and try:

1. **Book an appointment**: "I'd like to book a haircut for tomorrow at 2pm"
2. **Ask about services**: "What services do you offer?"
3. **Ask about pricing**: "How much is a women's haircut?"
4. **Ask about hours**: "What time are you open?"

## Troubleshooting

### Issue: Call Connects but No Audio

**Cause**: WebSocket connection to Vapi failed

**Solutions**:
- Verify `VAPI_API_KEY` and `VAPI_ASSISTANT_ID` are correct
- Check that your Vapi assistant is active
- Ensure your ngrok tunnel is running
- Check Vapi dashboard for assistant status

### Issue: Vapi Can't Call Backend APIs

**Cause**: URLs not accessible or authentication failing

**Solutions**:
- Verify `NGROK_URL` is set correctly and publicly accessible
- Check authentication configuration in Vapi tools
- Test API endpoints directly with curl:

```bash
curl -X POST https://your-ngrok.ngrok-free.app/api/ai/services \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "test-tenant-id"}'
```

### Issue: "Vapi not configured" Warning in Logs

**Cause**: Environment variables not set

**Solution**: Add to `.env`:

```env
VAPI_API_KEY=your_key_here
VAPI_ASSISTANT_ID=your_assistant_id_here
```

### Issue: Twilio Webhook Not Receiving Calls

**Cause**: Twilio webhook URL not configured

**Solution**:
1. Update Twilio phone number webhook URL
2. Ensure ngrok is running and URL matches
3. Check Twilio debugger for webhook errors

## Advanced Configuration

### Per-Tenant Assistants

For multi-tenant setups, you can create different Vapi assistants per tenant:

```javascript
// In call.handler.js
const tenantAssistantId = tenant.settings?.vapiAssistantId || vapiService.assistantId;

stream.parameter({
  name: 'assistantId',
  value: tenantAssistantId,
});
```

Store in tenant settings:

```json
{
  "vapiAssistantId": "assistant_tenant_specific_id",
  "aiAssistant": {
    "greeting": "Custom greeting for this salon",
    "tone": "professional"
  }
}
```

### Custom Voice Configuration

Configure different voices per tenant:

```json
{
  "voice": {
    "provider": "playht",
    "voiceId": "jennifer",
    "speed": 1.0,
    "stability": 0.5
  }
}
```

Available voice providers:
- PlayHT (recommended)
- ElevenLabs
- Azure
- Google

### Conversation Analytics

Track conversation metrics by processing Vapi webhooks:

```javascript
// In ai.controller.js
async handleVapiWebhook(req, res) {
  const { type, data } = req.body;
  
  switch (type) {
    case 'call.ended':
      // Track call metrics
      await prisma.callLog.update({
        where: { callSid: data.callSid },
        data: {
          durationSeconds: data.duration,
          notes: data.transcript,
          callReason: determineCallReason(data.summary)
        }
      });
      break;
    
    case 'function.called':
      // Track which tools were used
      logger.info(`Vapi called function: ${data.functionName}`);
      break;
  }
  
  res.sendStatus(200);
}
```

## Cost Considerations

### Vapi Pricing

- Charged per minute of conversation
- Different rates for voice providers
- Tool/function calls may have additional costs

### Optimization Tips

1. **Keep responses concise** - Shorter responses = less TTS usage
2. **Use efficient voice providers** - PlayHT is generally cheaper than ElevenLabs
3. **Batch API calls** - Combine service info queries when possible
4. **Implement timeouts** - End calls that are inactive for too long
5. **Cache common responses** - Business hours, service lists, etc.

## Production Checklist

Before going live:

- [ ] Vapi assistant configured and tested
- [ ] All tools/functions working correctly
- [ ] Webhook signature validation enabled
- [ ] JWT authentication configured properly
- [ ] Ngrok replaced with permanent domain
- [ ] SSL certificate installed
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Logging and monitoring set up
- [ ] Backup greeting message works (Vapi fallback)
- [ ] Call quality tested on different devices
- [ ] Conversation flows tested end-to-end
- [ ] Database indexes optimized for availability queries
- [ ] Cost monitoring set up
- [ ] Customer support process defined for edge cases

## Support & Resources

- **Vapi Documentation**: [https://docs.vapi.ai](https://docs.vapi.ai)
- **Vapi Discord**: Community support and discussions
- **Twilio Docs**: [https://www.twilio.com/docs](https://www.twilio.com/docs)
- **Backend API Documentation**: See `/backend/src/modules/ai-assistant/README.md`
- **AI Flow Documentation**: See `/docs/AI_FLOW.md`

## Summary

The Vapi integration allows your salon booking system to handle incoming calls with natural AI conversations. The flow is:

1. **Call received** → Twilio webhook → Backend
2. **Backend** → Identifies tenant → Generates TwiML
3. **TwiML** → Connects call to Vapi via WebSocket
4. **Vapi** → Handles conversation → Calls backend APIs
5. **Backend APIs** → Check availability, book appointments, etc.
6. **Vapi** → Responds to customer → Completes call
7. **Webhooks** → Update call logs and analytics

This creates a seamless experience where customers can book appointments, ask questions, and get information naturally through voice conversation.
