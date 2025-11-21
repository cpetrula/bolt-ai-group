# AI Assistant Module

## Overview

The AI Assistant module provides intelligent conversational capabilities for handling customer calls, understanding intent, and performing actions such as booking appointments, checking availability, and answering questions about services and business hours.

## Features

### 1. Pluggable AI Provider Architecture
- **Interface-based design** allows swapping AI implementations
- Support for multiple providers (OpenAI, Vapi, ElevenLabs)
- Easy to extend with new providers

### 2. Natural Language Understanding (NLU)
- Intent detection from customer input
- Entity extraction (dates, times, service names, etc.)
- Context-aware conversation handling

### 3. Call Orchestration
- Vapi integration for managing phone calls
- Inbound and outbound call support
- Webhook handling for call events

### 4. Intent Handlers
Supported intents:
- `check_availability` - Check available appointment slots
- `book_appointment` - Create new appointments
- `cancel_appointment` - Cancel existing appointments
- `modify_appointment` - Modify appointment details
- `ask_services` - Get information about services
- `ask_pricing` - Get pricing information
- `ask_hours` - Get business hours

### 5. AI-Callable API Endpoints
All endpoints require authentication via JWT token.

#### POST /api/ai/availability
Check available time slots for booking.

**Request:**
```json
{
  "employeeId": "employee-uuid",
  "serviceId": "service-uuid",
  "date": "2024-01-15",
  "addonIds": ["addon-uuid-1", "addon-uuid-2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "employeeId": "employee-uuid",
    "serviceId": "service-uuid",
    "availableSlots": [
      { "startTime": "09:00", "endTime": "10:00" },
      { "startTime": "10:00", "endTime": "11:00" }
    ]
  }
}
```

#### POST /api/ai/appointments
Manage appointments (create, update, cancel, get).

**Request (Create):**
```json
{
  "action": "create",
  "employeeId": "employee-uuid",
  "serviceId": "service-uuid",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "customerEmail": "john@example.com",
  "appointmentDate": "2024-01-15",
  "startTime": "10:00",
  "notes": "First time customer",
  "addonIds": []
}
```

**Request (Cancel):**
```json
{
  "action": "cancel",
  "appointmentId": "appointment-uuid",
  "cancellationReason": "Customer requested"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "id": "appointment-uuid",
    "employeeId": "employee-uuid",
    "serviceId": "service-uuid",
    "customerName": "John Doe",
    "appointmentDate": "2024-01-15T00:00:00.000Z",
    "startTime": "10:00",
    "status": "SCHEDULED"
  }
}
```

#### POST /api/ai/services
Get information about services.

**Request (Get All):**
```json
{}
```

**Request (Get Specific):**
```json
{
  "serviceId": "service-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "service-uuid",
      "name": "Women's Haircut",
      "description": "Professional haircut for women",
      "basePrice": 75,
      "durationMinutes": 60,
      "isActive": true,
      "addons": [
        {
          "id": "addon-uuid",
          "name": "Deep Conditioning Treatment",
          "price": 30,
          "durationMinutes": 20
        }
      ]
    }
  ]
}
```

#### POST /api/ai/process
Process natural language input and execute appropriate actions.

**Request:**
```json
{
  "userInput": "I'd like to book a haircut for tomorrow at 2pm",
  "context": {
    "customerPhone": "+1234567890",
    "customerEmail": "john@example.com",
    "customerName": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Great! I've booked your appointment for 2024-01-15 at 14:00. You'll receive a confirmation shortly.",
  "data": {
    "appointment": {
      "id": "appointment-uuid",
      "appointmentDate": "2024-01-15T00:00:00.000Z",
      "startTime": "14:00"
    }
  }
}
```

#### POST /api/ai/webhooks/vapi
Webhook endpoint for Vapi call events (no authentication required).

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# OpenAI - for LLM/NLU capabilities
OPENAI_API_KEY=sk-your_openai_api_key

# Vapi - for call orchestration
VAPI_API_KEY=your_vapi_api_key
VAPI_ASSISTANT_ID=your_vapi_assistant_id

# ElevenLabs - for TTS (optional)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### Per-Tenant Configuration

Tenant-specific AI settings can be configured in the tenant settings JSON field:

```json
{
  "aiAssistant": {
    "greeting": "Thank you for calling [Business Name]. How can I help you today?",
    "tone": "professional",
    "businessHours": {
      "monday": "9:00 AM - 6:00 PM",
      "tuesday": "9:00 AM - 6:00 PM",
      "wednesday": "9:00 AM - 6:00 PM",
      "thursday": "9:00 AM - 6:00 PM",
      "friday": "9:00 AM - 6:00 PM",
      "saturday": "10:00 AM - 4:00 PM",
      "sunday": "Closed"
    }
  }
}
```

## Architecture

### AI Provider Interface
The module uses a pluggable architecture with three main provider types:

1. **AIProvider** - Natural language processing
   - `generateCompletion()` - Generate AI responses
   - `detectIntent()` - Detect user intent
   - `extractEntities()` - Extract entities from text

2. **CallOrchestrationProvider** - Phone call management
   - `initiateCall()` - Start outbound calls
   - `handleIncomingCall()` - Process inbound calls
   - `endCall()` - Terminate calls
   - `getCallStatus()` - Check call status

3. **TTSProvider** - Text-to-speech
   - `synthesize()` - Convert text to audio
   - `getVoices()` - List available voices

### Services

#### OpenAI Service (`openai.service.ts`)
- Implements `AIProvider` interface
- Uses GPT-4 for intent detection and entity extraction
- Configurable temperature and token limits

#### Vapi Service (`vapi.service.ts`)
- Implements `CallOrchestrationProvider` interface
- Manages phone call lifecycle
- Configures AI assistant behavior
- Handles webhooks for call events

### Intent Handler (`intent.handler.ts`)
- Routes detected intents to appropriate handlers
- Integrates with appointment and service modules
- Provides natural language responses
- Context-aware processing

### Controller (`ai.controller.ts`)
- Exposes REST API endpoints
- Validates requests
- Handles authentication
- Formats responses

## Usage Examples

### Example 1: Vapi Assistant Configuration

```typescript
import { vapiService } from './modules/ai-assistant/vapi.service';

// Configure the AI assistant
const assistant = await vapiService.configureAssistant({
  name: 'Salon Booking Assistant',
  firstMessage: 'Hello! I\'m here to help you book an appointment. What service are you interested in?',
  model: 'gpt-4',
  voice: 'jennifer-playht',
  systemPrompt: 'You are a helpful salon booking assistant. Be friendly and professional.'
});
```

### Example 2: Process Natural Language

```typescript
import { processUserInput } from './modules/ai-assistant/intent.handler';

const result = await processUserInput(
  "I'd like to book a haircut for tomorrow at 2pm",
  {
    tenantId: 'tenant-uuid',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    customerEmail: 'john@example.com'
  }
);

console.log(result.message);
// Output: "Great! I've booked your appointment for 2024-01-15 at 14:00..."
```

### Example 3: Intent Detection

```typescript
import { openaiService } from './modules/ai-assistant/openai.service';

const intentResult = await openaiService.detectIntent(
  "What time are you open on Monday?"
);

console.log(intentResult);
// Output: { intent: 'ask_hours', confidence: 0.95, entities: { day: 'monday' } }
```

## Testing

To test the AI endpoints, you'll need:

1. Valid JWT authentication token
2. API keys for OpenAI and Vapi
3. Test tenant with configured services and employees

Example with cURL:

```bash
# Get availability
curl -X POST http://localhost:3000/api/ai/availability \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "employee-uuid",
    "serviceId": "service-uuid",
    "date": "2024-01-15"
  }'

# Process natural language
curl -X POST http://localhost:3000/api/ai/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userInput": "What are your hours?",
    "context": {
      "customerPhone": "+1234567890"
    }
  }'
```

## Security Considerations

- All AI endpoints (except webhooks) require JWT authentication
- Rate limiting is applied to prevent abuse
- Tenant isolation ensures data privacy
- API keys are stored as environment variables
- Webhook endpoints validate request signatures (when implemented)

## Future Enhancements

- [ ] Add ElevenLabs TTS integration
- [ ] Implement sentiment analysis
- [ ] Add conversation history tracking
- [ ] Support for multi-language conversations
- [ ] Advanced analytics and reporting
- [ ] A/B testing for different prompts
- [ ] Integration with more AI providers (Anthropic Claude, etc.)
- [ ] Voice biometrics for customer identification

## Dependencies

The AI Assistant module integrates with:

- **Appointments Module** - For booking and availability
- **Services Module** - For service information
- **Tenants Module** - For business settings
- **Telephony Module** - For call logging
- **OpenAI API** - For natural language processing
- **Vapi API** - For call orchestration

## Troubleshooting

### Common Issues

**Issue:** OpenAI API errors
- **Solution:** Check that `OPENAI_API_KEY` is set correctly
- Verify API key has sufficient credits
- Check OpenAI service status

**Issue:** Vapi webhook not receiving events
- **Solution:** Ensure webhook URL is publicly accessible
- Verify Vapi assistant configuration
- Check firewall and security settings

**Issue:** Intent detection not accurate
- **Solution:** Adjust temperature in OpenAI service
- Improve system prompts
- Provide more context in requests

**Issue:** Authentication errors
- **Solution:** Verify JWT token is valid and not expired
- Check that multi-tenant middleware is working
- Ensure request includes valid Authorization header

## License

This module is part of the Bolt AI Salon Assistant project. See the main LICENSE file for details.
