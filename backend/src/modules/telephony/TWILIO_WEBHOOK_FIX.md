# Twilio Webhook Signature Validation Fix

## Problem
The application was experiencing "Invalid Twilio signature" errors when Twilio attempted to deliver webhooks to the application endpoints.

## Root Causes

### 1. GET Request Parameter Handling
- **Issue**: Twilio supports both GET and POST methods for webhooks
- **Problem**: Code always used `req.body` for parameters, which is empty for GET requests
- **Impact**: GET requests from Twilio would fail signature validation because parameters were in `req.query`

### 2. Protocol Mismatch
- **Issue**: When behind ngrok or a reverse proxy, `req.protocol` returns 'http' 
- **Problem**: Twilio signs webhooks with the actual URL it calls (https)
- **Impact**: URL used for signature validation didn't match Twilio's signed URL

### 3. X-Forwarded-Proto Header
- **Issue**: Proxies and load balancers use X-Forwarded-Proto header
- **Problem**: Header was ignored, causing protocol mismatch
- **Impact**: Signature validation failed when deployed behind proxy/ngrok

## Solution

### New Helper Function: `validateTwilioRequest()`
Created a comprehensive validation function that handles all edge cases:

```javascript
const validateTwilioRequest = (req) => {
  // 1. Extract signature from headers
  const signature = req.headers['x-twilio-signature'];
  
  // 2. Determine correct protocol (handle proxies)
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = forwardedProto 
    ? forwardedProto.split(',')[0].trim()  // Handle multiple values
    : req.protocol;
  
  // 3. Construct full URL as Twilio sees it
  const url = `${protocol}://${req.get('host')}${req.originalUrl}`;
  
  // 4. Get parameters based on request method
  const params = req.method === 'POST' ? req.body : req.query;
  
  // 5. Validate using Twilio's SDK
  return twilio.validateRequest(env.twilioAuthToken, signature, url, params);
};
```

### Key Improvements

1. **GET/POST Support**: Correctly handles parameters for both request methods
2. **Proxy-Aware**: Respects X-Forwarded-Proto header for protocol detection
3. **Multiple Protocols**: Handles comma-separated X-Forwarded-Proto values
4. **Full URL Construction**: Uses `originalUrl` to include query parameters
5. **Better Logging**: Debug logs show the exact URL being validated

## Files Changed

### 1. `twilio.service.js`
- Added `validateTwilioRequest()` function
- Kept `validateTwilioSignature()` for backward compatibility
- Exported new function

### 2. `call.handler.js`
- Updated `handleIncomingCall()` to use new validation
- Updated `handleCallStatus()` to use new validation
- Added GET/POST parameter extraction

### 3. `sms.handler.js`
- Updated `handleIncomingSMS()` to use new validation
- Added GET/POST parameter extraction

## Testing

### Manual Testing Scenarios
1. ✅ POST request with HTTPS
2. ✅ POST request behind proxy (X-Forwarded-Proto)
3. ✅ GET request with query parameters
4. ✅ Invalid signature rejection
5. ✅ Missing signature rejection

### Security
- ✅ CodeQL scan passed with 0 alerts
- ✅ Signature validation still enforced
- ✅ No security regressions

## Deployment Notes

### Environment Variables Required
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Webhook Configuration in Twilio
Voice webhooks:
- URL: `https://your-domain.com/api/webhooks/twilio/voice`
- Method: POST (recommended) or GET
- Status Callback: `https://your-domain.com/api/webhooks/twilio/voice/status`

SMS webhooks:
- URL: `https://your-domain.com/api/webhooks/twilio/sms`
- Method: POST (recommended) or GET

### Important: HTTPS Required
- Twilio requires HTTPS for webhooks in production
- Use ngrok for local development: `ngrok http 3000`
- Update webhook URLs in Twilio Console when URL changes

## Troubleshooting

### Still Getting "Invalid Twilio signature"?

1. **Check Auth Token**: Ensure `TWILIO_AUTH_TOKEN` in `.env` matches Twilio Console
2. **Check Webhook URL**: URL in Twilio Console must exactly match where webhooks are sent
3. **Check Protocol**: Ensure Twilio is configured for HTTPS if using HTTPS
4. **Enable Debug Logging**: Set `LOG_LEVEL=debug` to see validation details
5. **Check Twilio Debugger**: https://console.twilio.com/debugger shows webhook delivery attempts

### Debug Output
With `LOG_LEVEL=debug`, you'll see:
```
DEBUG: Validating Twilio signature for POST https://abc123.ngrok.io/api/webhooks/twilio/voice
```

Compare this URL with what's shown in Twilio Debugger.

## References

- [Twilio Security: Validating Requests](https://www.twilio.com/docs/usage/security#validating-requests)
- [Twilio Webhook Best Practices](https://www.twilio.com/docs/usage/webhooks)
- [Express Behind Proxies](https://expressjs.com/en/guide/behind-proxies.html)

## Backward Compatibility

The old `validateTwilioSignature(signature, url, params)` function is still available and exported for backward compatibility. However, new code should use `validateTwilioRequest(req)` which is more robust and easier to use.

## Future Enhancements

Potential improvements for consideration:
1. Add request timeout handling
2. Add webhook retry logic
3. Add webhook event logging to database
4. Add webhook health monitoring
5. Add support for webhook signature verification middleware
