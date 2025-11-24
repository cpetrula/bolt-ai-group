# Business Name Variable in Vapi Calls

## Overview

The Vapi service now supports passing the business name as a variable to the AI assistant through the `assistantOverrides.variableValues` field. This allows the AI assistant to personalize conversations by referring to the specific business name.

## Usage

### Outbound Calls (initiateCall)

When initiating an outbound call, pass the business name in the options:

```javascript
const { vapiService } = require('./vapi.service');

// Example: Initiate a call with business name
async function makeOutboundCall(phoneNumber, tenant) {
  const callId = await vapiService.initiateCall(phoneNumber, {
    businessName: tenant.name,
    // Other options...
    metadata: {
      tenantId: tenant.id,
      callType: 'appointment_reminder'
    }
  });
  
  console.log(`Call initiated with ID: ${callId}`);
  return callId;
}
```

### Web Calls (createWebCall)

When creating a web call session, pass the business name in the options:

```javascript
const { vapiService } = require('./vapi.service');

// Example: Create a web call with business name
async function createIncomingWebCall(customerPhone, tenant) {
  const callId = await vapiService.createWebCall({
    businessName: tenant.name,
    customer: {
      number: customerPhone
    },
    metadata: {
      tenantId: tenant.id,
      callType: 'incoming'
    }
  });
  
  console.log(`Web call created with ID: ${callId}`);
  return callId;
}
```

## Implementation Details

### Request Payload

When `businessName` is provided in the options, it is automatically converted to the correct format:

**Input:**
```javascript
{
  businessName: "Elegant Salon & Spa",
  customer: { number: "+1234567890" }
}
```

**Actual API Payload Sent to Vapi:**
```json
{
  "assistantId": "asst_xxxxx",
  "customer": {
    "number": "+1234567890"
  },
  "assistantOverrides": {
    "variableValues": {
      "business name": "Elegant Salon & Spa"
    }
  }
}
```

### Variable Name

The variable is always named `"business name"` (with a space) in the `variableValues` object, as per Vapi's convention.

### Dynamic Business Name

The business name should be dynamically retrieved from the tenant record:

```javascript
const { prisma } = require('../../config/db');

async function handleCallWithTenant(tenantId, phoneNumber) {
  // Get tenant from database
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });
  
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  
  // Use the tenant's business name
  const callId = await vapiService.initiateCall(phoneNumber, {
    businessName: tenant.name
  });
  
  return callId;
}
```

## Vapi Assistant Configuration

To use the business name variable in your Vapi assistant, reference it in your assistant's system prompt or first message:

### System Prompt Example:
```
You are a helpful AI assistant for {{business name}}. 
Greet customers warmly and help them book appointments, 
answer questions about services, and provide information 
about {{business name}}.
```

### First Message Example:
```
Hello! Thank you for calling {{business name}}. 
How may I assist you today?
```

## Testing

You can test this feature by:

1. Ensuring your Vapi assistant has the `{{business name}}` variable in its configuration
2. Calling the API methods with a businessName parameter
3. Verifying that the assistant uses the correct business name in its responses

## Notes

- The `businessName` parameter is optional. If not provided, no `assistantOverrides` will be added.
- The business name is automatically removed from the top-level payload to avoid duplication.
- Existing `assistantOverrides` are preserved and merged with the new `variableValues`.
