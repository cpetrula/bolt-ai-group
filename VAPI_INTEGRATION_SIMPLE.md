# Vapi Integration Guide - Simplified Setup

## Overview

This guide explains how to integrate Vapi with your Bolt AI Group salon booking system to handle incoming phone calls with AI-powered conversation using the **Phone Call Provider Bypass** method.

## How It Works

### Simple Flow

```
Customer → Calls Your Twilio Number → Backend Webhook → Calls Vapi API → Vapi Returns TwiML → Twilio Connects to Vapi WebSocket → Vapi AI Assistant
```

**The key**: Instead of forwarding to a Vapi phone number, we call Vapi's API which generates a unique WebSocket URL for each call.

## Quick Setup (5 Minutes)

### Step 1: Create Vapi Account & Assistant

1. Go to [https://vapi.ai](https://vapi.ai) and sign up
2. Create a new assistant:
   - Name: "Salon Booking Assistant"
   - Model: GPT-4
   - Voice: Choose a voice you like (PlayHT Jennifer is popular)
3. Configure the system prompt (see below)
4. Add tools/functions for your backend APIs (see below)

### Step 2: Get Your Vapi Credentials

From the Vapi dashboard, get:
- **API Key**: From Account Settings
- **Assistant ID**: From your assistant's settings
- **Phone Number ID** (Optional): If you have a phone number configured in Vapi

### Step 3: Configure Environment Variables

Add to your `.env` file:

```env
# Vapi Configuration
VAPI_API_KEY=your_api_key_from_vapi_dashboard
VAPI_ASSISTANT_ID=your_assistant_id
VAPI_PHONE_NUMBER_ID=your_phone_number_id  # Optional

# Your backend URL (for Vapi to call your APIs)
NGROK_URL=https://your-ngrok-url.ngrok-free.app
```

### Step 4: Done!

That's it! When someone calls your Twilio number:
1. Twilio sends webhook to your backend
2. Your backend calls Vapi's API with `phoneCallProviderBypassEnabled: true`
3. Vapi returns TwiML with a unique WebSocket URL
4. Twilio connects to that WebSocket URL
5. Vapi's AI handles the conversation
6. Vapi calls your backend APIs to book appointments, check availability, etc.

## Vapi Assistant Configuration

### System Prompt

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

Business hours: Monday-Friday 9AM-6PM, Saturday 10AM-5PM, Closed Sunday
```

### Configure Tools (Functions)

Vapi needs to call your backend APIs. Configure these tools:

#### Tool 1: Check Availability

```json
{
  "type": "function",
  "function": {
    "name": "check_availability",
    "description": "Check available appointment slots",
    "parameters": {
      "type": "object",
      "properties": {
        "date": {
          "type": "string",
          "description": "Date to check (YYYY-MM-DD)"
        },
        "serviceId": {
          "type": "string",
          "description": "Service ID"
        }
      },
      "required": ["date"]
    }
  },
  "server": {
    "url": "https://your-ngrok-url.ngrok-free.app/api/ai/availability",
    "method": "POST"
  }
}
```

#### Tool 2: Book Appointment

```json
{
  "type": "function",
  "function": {
    "name": "book_appointment",
    "description": "Create a new appointment",
    "parameters": {
      "type": "object",
      "properties": {
        "customerName": {"type": "string"},
        "customerPhone": {"type": "string"},
        "appointmentDate": {"type": "string"},
        "startTime": {"type": "string"},
        "serviceId": {"type": "string"}
      },
      "required": ["customerName", "customerPhone", "appointmentDate", "startTime"]
    }
  },
  "server": {
    "url": "https://your-ngrok-url.ngrok-free.app/api/ai/appointments",
    "method": "POST"
  }
}
```

#### Tool 3: Get Services

```json
{
  "type": "function",
  "function": {
    "name": "get_services",
    "description": "Get available services and pricing",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  "server": {
    "url": "https://your-ngrok-url.ngrok-free.app/api/ai/services",
    "method": "POST"
  }
}
```

## Testing

### 1. Start Your Backend

```bash
cd backend
npm run dev
```

### 2. Start Ngrok

```bash
./start-ngrok.sh
```

### 3. Call Your Twilio Number

The call flow:
1. You call your Twilio number
2. Backend receives webhook
3. TwiML forwards call to Vapi
4. You hear Vapi's AI assistant greeting
5. Try: "I'd like to book a haircut for tomorrow at 2pm"

## Code Explanation

### What Happens in `call.handler.js`

```javascript
// 1. Twilio calls your webhook
handleIncomingCall(req, res) {
  // 2. Identify tenant
  const tenant = await prisma.tenant.findFirst({
    where: { twilioPhoneNumber: req.body.To }
  });
  
  // 3. Create call log
  const callLog = await prisma.callLog.create({ ... });
  
  // 4. Call Vapi API to create inbound call
  if (vapiService.apiKey && vapiService.assistantId) {
    // Use phone call provider bypass
    twiml = await vapiService.createInboundCall({
      customerNumber: req.body.From,
      businessName: tenant.name,
      tenantId: tenant.id,
      metadata: { callLogId: callLog.id, callSid: req.body.CallSid }
    });
  } else {
    // Fallback: basic greeting
    twiml = twilioService.generateVoiceResponse(greeting);
  }
  
  // 5. Send TwiML to Twilio
  res.send(twiml);
}
```

### In `vapi.service.js`

```javascript
// Create inbound call with provider bypass
async createInboundCall(options) {
  const { customerNumber, businessName, tenantId, metadata } = options;
  
  // Call Vapi's API
  const response = await fetch('https://api.vapi.ai/call', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    },
    body: JSON.stringify({
      assistantId: this.assistantId,
      phoneCallProviderBypassEnabled: true,
      customer: { number: customerNumber },
      phoneNumberId: this.phoneNumberId,  // Optional
      metadata: { tenantId, ...metadata },
      assistantOverrides: {
        variableValues: { businessName }
      }
    })
  });
  
  const data = await response.json();
  
  // Return TwiML from Vapi's response
  return data.phoneCallProviderDetails.twiml;
}
```

### Generated TwiML Example

Vapi returns TwiML with a unique WebSocket URL for each call:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://api.vapi.ai/abc123-unique-call-id/transport">
      <!-- Vapi manages parameters internally -->
    </Stream>
  </Connect>
</Response>
```

**Key Point**: The WebSocket URL is unique for each call and generated by Vapi, not hardcoded!

## Security & Best Practices

✅ **Secure**: API key sent via Authorization header, not exposed in URLs
✅ **Modern**: Uses Vapi's latest phone call provider bypass approach
✅ **Dynamic**: Each call gets a unique WebSocket URL from Vapi
✅ **Reliable**: Vapi handles all AI logic
✅ **Scalable**: Works for any number of tenants

### API Authentication

Your backend APIs need authentication. Options:

**Option 1**: Create a service account JWT for Vapi
```javascript
// Generate a long-lived token
const token = jwt.sign(
  { service: 'vapi', tenantId: 'all' },
  process.env.JWT_SECRET,
  { expiresIn: '1y' }
);
```

Add to Vapi tool headers:
```json
{
  "headers": {
    "Authorization": "Bearer YOUR_SERVICE_ACCOUNT_TOKEN"
  }
}
```

**Option 2**: Exempt /api/ai/* from auth middleware

## Troubleshooting

### WebSocket handshake error

**This was the original issue!** It happened when using a static WebSocket URL.

**Solution**: The code now uses Vapi's API to get a unique WebSocket URL for each call.

**Check**:
- Is `VAPI_API_KEY` set in `.env`?
- Is `VAPI_ASSISTANT_ID` set in `.env`?
- Check backend logs for "Successfully created Vapi inbound call"
- Check Vapi dashboard to see if call was received

### Call doesn't connect to Vapi

**Check**:
- Backend logs for errors when calling Vapi API
- Vapi API key is correct (starts with `sk_`)
- Assistant ID is correct (format: `asst_...`)
- Network connectivity to `api.vapi.ai`

### Vapi doesn't call your APIs

**Check**:
- Is `NGROK_URL` publicly accessible?
- Test with: `curl https://your-ngrok-url.ngrok-free.app/api/ai/services`
- Check Vapi dashboard for tool call logs
- Verify API authentication

### Call quality issues

**Check**:
- Vapi voice settings (try different providers)
- Network connectivity
- Twilio call quality

## Advanced: Per-Tenant Vapi Assistants

For multi-tenant setups, you can have different Vapi assistants per tenant:

```javascript
// In call.handler.js
const vapiPhoneNumber = tenant.settings?.vapiPhoneNumber 
  || env.vapiPhoneNumber;
```

Store in tenant settings:
```json
{
  "vapiPhoneNumber": "+15559991111",
  "vapiAssistantId": "assistant_custom_id"
}
```

## Cost Optimization

- Vapi charges per minute of conversation
- Typical call: 2-3 minutes = ~$0.05-$0.10
- Keep responses concise to reduce TTS costs
- Use cheaper voice providers (PlayHT vs ElevenLabs)

## Summary

That's it! Three simple steps:
1. Create Vapi assistant → Get API key and Assistant ID
2. Add VAPI_API_KEY and VAPI_ASSISTANT_ID to .env
3. Configure tools to call your backend APIs

The phone call provider bypass approach ensures:
- Each call gets a unique WebSocket connection
- No WebSocket handshake errors
- Better security (no API keys in URLs)
- Full compatibility with Vapi's latest features

Your callers will experience seamless AI-powered appointment booking without you building any AI infrastructure!

## Support

- **Vapi Docs**: https://docs.vapi.ai
- **Vapi Provider Bypass Guide**: https://docs.vapi.ai/calls/call-handling-with-vapi-and-twilio
- **Vapi Discord**: Active community support
- **Backend API Docs**: See `/backend/src/modules/ai-assistant/README.md`
