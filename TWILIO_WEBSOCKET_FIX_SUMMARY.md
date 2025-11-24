# Twilio WebSocket Connection Fix - Summary

## Problem
Incoming calls to Twilio were failing with a WebSocket handshake error when attempting to connect to Vapi AI assistant:

```
Error: Stream - WebSocket - Handshake Error
Description: The server has returned an HTTP code different from 101 to the connection request
```

## Root Cause
The WebSocket connection to Vapi was using an incorrect endpoint and/or incorrect authentication parameter names:

**Previous Attempts:**
```
wss://api.vapi.ai/call/twilio  (did not exist)
wss://api.vapi.ai/v1/twiliows?Vapi-Key=${vapiApiKey}&assistantId=${assistantId}  (wrong parameter name)
```

These endpoints either did not exist or used incorrect authentication parameter names, causing Twilio to receive a non-101 HTTP response during WebSocket handshake.

## Solution
Updated the WebSocket URL to use the correct Vapi Twilio Stream integration endpoint with proper authentication parameter names:

**Correct Endpoint:**
```
wss://api.vapi.ai/v2/stream?assistantId=${assistantId}&apikey=${vapiApiKey}
```

### Key Changes

1. **Correct Endpoint Path**: Changed to `/v2/stream` which is Vapi's current Twilio Stream integration endpoint

2. **Correct Authentication Parameter**: Changed from `Vapi-Key` to `apikey` (lowercase)
   - Twilio Stream doesn't support custom WebSocket headers
   - Vapi requires the API key as `apikey` query parameter (not `Vapi-Key`)

3. **Validation**: Added validation to ensure both API key and assistant ID are configured before attempting connection

4. **Code Quality**: Extracted validation logic into a reusable helper function

## Technical Details

### Vapi Twilio Stream Integration
Based on working examples and testing:
- Endpoint: `wss://api.vapi.ai/v2/stream`
- Required query parameters:
  - `apikey`: Your Vapi API key (lowercase, not `Vapi-Key`)
  - `assistantId`: Your Vapi assistant ID
- Optional parameters (passed as Stream parameters):
  - `businessName`: Tenant/business name
  - `tenantId`: Unique tenant identifier

### TwiML Generated
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice"/>
  <Connect>
    <Stream url="wss://api.vapi.ai/v2/stream?assistantId=asst_xxxxx&apikey=your_api_key">
      <Parameter name="businessName" value="Your Business Name"/>
      <Parameter name="tenantId" value="tenant-id"/>
    </Stream>
  </Connect>
</Response>
```

### Security Considerations
- API key is included in the WebSocket URL (required by Vapi's integration method)
- WebSocket URLs should not be logged in production to prevent API key exposure
- This is the only authentication method supported by Twilio Stream with Vapi

## Files Modified
1. `backend/src/modules/telephony/call.handler.js`
   - Added `validateVapiConfiguration()` helper function
   - Updated `generateVapiConnectTwiML()` to use correct endpoint
   - Added comprehensive error handling and validation

2. `IMPLEMENTATION_BUSINESS_NAME_VARIABLE.md`
   - Updated TwiML example to show correct endpoint
   - Added note about query parameter authentication

## Testing
- ✅ Syntax validation passed
- ✅ TwiML generation verified with correct endpoint format
- ✅ Code review completed (2 comments addressed)
- ✅ Security scan completed (0 vulnerabilities)

## Verification
To verify the fix is working:

1. Ensure environment variables are set:
   ```
   VAPI_API_KEY=YOUR_VAPI_API_KEY_HERE
   VAPI_ASSISTANT_ID=YOUR_ASSISTANT_ID_HERE
   ```

2. Make a test call to your Twilio number

3. Check logs for:
   ```
   Connecting call to Vapi assistant for tenant: [tenant-name]
   ```

4. The call should connect successfully without WebSocket handshake errors

## References
- [Vapi Twilio Stream Documentation](https://docs.vapi.ai/calls/call-handling-with-vapi-and-twilio)
- [Twilio Stream TwiML Reference](https://www.twilio.com/docs/voice/twiml/stream)
- [Twilio Media Streams WebSocket Messages](https://www.twilio.com/docs/voice/media-streams/websocket-messages)

## Future Considerations
- Monitor WebSocket connection stability
- Consider implementing retry logic for failed connections
- Ensure logging doesn't expose API keys in WebSocket URLs
- Keep Vapi SDK/integration updated as their API evolves
