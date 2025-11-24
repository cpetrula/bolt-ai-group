# Vapi Setup Guide - Quick Reference

## Problem This Solves
If you're experiencing WebSocket handshake errors with Vapi integration, this guide will help you set up the correct configuration.

## Required Environment Variables

Add these to your `.env` file:

```env
# Required - Vapi API credentials
VAPI_API_KEY=[REDACTED]
VAPI_ASSISTANT_ID=asst_xxxxxxxxxxxxxxxxxxxxxxxx

# Optional - Only needed if you have a phone number configured in Vapi
VAPI_PHONE_NUMBER_ID=ph_xxxxxxxxxxxxxxxxxxxxxxxx
```

## How to Get These Values

### 1. Get VAPI_API_KEY

1. Go to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Click on your profile/account in the top right
3. Go to "Account" or "API Keys"
4. Copy your API key (starts with `sk_live_` or `sk_test_`)

### 2. Get VAPI_ASSISTANT_ID

1. Go to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Click on "Assistants" in the sidebar
3. Select the assistant you want to use for phone calls
4. Copy the Assistant ID from the assistant details (starts with `asst_`)

### 3. Get VAPI_PHONE_NUMBER_ID (Optional)

This is **optional**. Only set this if:
- You have a phone number configured in Vapi dashboard
- You want to associate incoming calls with a specific Vapi phone number

To get it:
1. Go to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Click on "Phone Numbers" in the sidebar
3. Select your phone number
4. Copy the Phone Number ID (starts with `ph_`)

**Note:** If you don't have a phone number in Vapi or don't need this association, you can skip this variable.

## Verification

After setting the environment variables, restart your backend:

```bash
cd backend
npm run dev
```

Look for these log messages (indicating correct setup):
- `Vapi API key not configured` - ❌ VAPI_API_KEY is missing
- `Vapi Assistant ID not configured` - ❌ VAPI_ASSISTANT_ID is missing
- No warnings about Vapi - ✅ All required config is set

## Testing the Integration

1. Make a test call to your Twilio number
2. Check backend logs for:
   ```
   Creating Vapi inbound call for tenant: [your-tenant-name]
   Successfully created Vapi inbound call
   ```
3. Check Vapi dashboard under "Calls" to see if the call appears
4. If you don't see WebSocket handshake errors, the fix is working! 🎉

## Troubleshooting

### "Vapi API key not configured" warning
- Double-check that `VAPI_API_KEY` is set in your `.env` file
- Make sure the key starts with `sk_` (not a public key)
- Restart your backend after adding it

### "Vapi Assistant ID not configured" warning
- Double-check that `VAPI_ASSISTANT_ID` is set in your `.env` file
- Make sure it starts with `asst_`
- Verify the assistant exists in your Vapi dashboard

### Calls not reaching Vapi
- Check that both VAPI_API_KEY and VAPI_ASSISTANT_ID are set
- Verify your API key is valid (try making a test API call)
- Check backend logs for "Failed to create Vapi inbound call" errors

### WebSocket handshake errors
- If you still see these errors, make sure you've deployed the latest code
- The fix changes how WebSocket URLs are generated (dynamic vs static)
- Check that you're not using an old version of the code

## What Changed (Technical)

**Before (Incorrect - causes handshake errors):**
```javascript
// Static WebSocket URL - WRONG!
const url = `wss://api.vapi.ai/v2/stream?assistantId=${assistantId}&apikey=${apiKey}`;
```

**After (Correct - uses phone call provider bypass):**
```javascript
// Call Vapi API to get dynamic WebSocket URL - CORRECT!
const response = await fetch('https://api.vapi.ai/call', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: JSON.stringify({
    assistantId: assistantId,
    phoneCallProviderBypassEnabled: true,
    customer: { number: callerNumber }
  })
});
const twiml = response.json().phoneCallProviderDetails.twiml;
// TwiML contains: wss://api.vapi.ai/{unique-call-id}/transport
```

Each call gets a unique WebSocket URL, which prevents handshake errors.

## Additional Resources

- [TWILIO_WEBSOCKET_FIX_SUMMARY.md](./TWILIO_WEBSOCKET_FIX_SUMMARY.md) - Detailed technical summary
- [VAPI_INTEGRATION_GUIDE.md](./VAPI_INTEGRATION_GUIDE.md) - Complete integration guide
- [VAPI_INTEGRATION_SIMPLE.md](./VAPI_INTEGRATION_SIMPLE.md) - Simplified setup guide
- [Vapi Official Documentation](https://docs.vapi.ai/calls/call-handling-with-vapi-and-twilio)
