# AI Conversation Flow Documentation

## Overview

The AI Assistant module enables natural language interactions with customers via phone calls, allowing them to book, modify, or cancel appointments, get pricing information, check business hours, and more. The system uses a combination of AI providers (OpenAI, Vapi) to understand customer intent and execute appropriate actions.

## Architecture

### AI Provider Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Customer Phone Call                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Twilio (Telephony)                        │
│  - Receives incoming calls                                   │
│  - Converts voice to events                                  │
│  - Sends TwiML responses                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Vapi (Call Orchestration) [Optional]            │
│  - Manages call flow                                         │
│  - Speech-to-Text (STT)                                      │
│  - Text-to-Speech (TTS)                                      │
│  - Conversation state management                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              OpenAI (Natural Language Processing)            │
│  - Intent detection (GPT-4)                                  │
│  - Entity extraction                                         │
│  - Response generation                                       │
│  - Context understanding                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend API (Bolt AI Group)                   │
│  - Business logic execution                                  │
│  - Database operations                                       │
│  - Appointment booking/management                            │
│  - Availability checking                                     │
└─────────────────────────────────────────────────────────────┘
```

## Call Flow Sequence

### 1. Incoming Call

```
Customer → Twilio Phone Number → Webhook → Backend
```

**Step-by-Step**:
1. Customer dials the tenant's Twilio phone number
2. Twilio receives the call and sends a webhook to `POST /api/webhooks/twilio/voice`
3. Backend identifies the tenant by matching `To` number with `twilioPhoneNumber`
4. Call log entry created in database with status "in-progress"
5. Backend returns TwiML response to Twilio

**TwiML Response Example**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling Elegant Hair Salon. Please hold while we connect you to our AI assistant.</Say>
  <Redirect>https://api.vapi.ai/call/start</Redirect>
</Response>
```

### 2. AI Greeting

**Vapi Configuration**:
- Assistant ID configured per tenant
- First message customized from tenant settings
- Voice selection (e.g., "jennifer-playht")

**Greeting Template**:
```
"Hello! Thank you for calling [Business Name]. 
I'm your virtual assistant. How can I help you today?"
```

**Tenant-Specific Customization**:
```json
{
  "aiAssistant": {
    "greeting": "Welcome to Elegant Hair Salon! I'm here to help you book an appointment or answer any questions. What can I do for you today?",
    "tone": "friendly",
    "voiceId": "jennifer-playht"
  }
}
```

### 3. Intent Detection

When customer speaks, the AI processes the input through multiple stages:

**Speech-to-Text (STT)**:
- Vapi or Twilio converts speech to text
- Text sent to OpenAI for processing

**Intent Classification**:
OpenAI GPT-4 analyzes the text to detect intent:

```javascript
// Example OpenAI Prompt
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant for a hair salon. Classify the customer's intent from: book_appointment, cancel_appointment, modify_appointment, ask_hours, ask_pricing, ask_services, other."
    },
    {
      "role": "user",
      "content": "I'd like to schedule a haircut for tomorrow at 2pm"
    }
  ]
}
```

**Response**:
```json
{
  "intent": "book_appointment",
  "confidence": 0.95,
  "entities": {
    "service": "haircut",
    "date": "tomorrow",
    "time": "2pm"
  }
}
```

**Supported Intents**:
1. `book_appointment` - Customer wants to schedule an appointment
2. `cancel_appointment` - Customer wants to cancel existing appointment
3. `modify_appointment` - Customer wants to change appointment details
4. `ask_hours` - Customer asking about business hours
5. `ask_pricing` - Customer asking about service prices
6. `ask_services` - Customer asking what services are offered
7. `check_availability` - Customer asking about available time slots
8. `other` - Fallback for unrecognized intent

### 4. Entity Extraction

After intent is detected, AI extracts relevant entities:

**Common Entities**:
- **Service**: "haircut", "color", "highlights", etc.
- **Date**: "tomorrow", "next Monday", "January 15th"
- **Time**: "2pm", "14:00", "two o'clock"
- **Employee**: "Sarah", "with Mike", "any stylist"
- **Customer Info**: name, phone number, email
- **Appointment ID**: for modifications/cancellations

**Entity Normalization**:
```javascript
// Raw input: "tomorrow at 2pm"
// Normalized:
{
  "date": "2024-01-16",  // ISO format
  "time": "14:00"        // 24-hour format
}
```

### 5. Intent Handling

Each intent has a specific handler that executes business logic:

#### Intent: Book Appointment

**Conversation Flow**:
```
AI: "I'd be happy to help you book an appointment. What service are you interested in?"
Customer: "A women's haircut"

AI: "Great! Do you have a preferred stylist, or would you like the next available?"
Customer: "Next available is fine"

AI: "What date works best for you?"
Customer: "Tomorrow around 2pm"

AI: [Checks availability via API]
    "I have the following times available tomorrow:
     - 2:00 PM with Sarah
     - 2:30 PM with Mike
     - 3:00 PM with Sarah
     Which would you prefer?"

Customer: "2pm with Sarah sounds good"

AI: "Perfect! May I have your name and phone number for the appointment?"
Customer: "Jane Doe, 555-123-4567"

AI: [Creates appointment via API]
    "Great! I've booked your women's haircut with Sarah tomorrow at 2:00 PM. 
     You'll receive a confirmation text shortly. Is there anything else I can help you with?"
```

**API Calls Made**:
1. `POST /api/ai/services` - Get available services
2. `GET /api/employees?serviceId=xxx` - Get employees who perform this service
3. `POST /api/ai/availability` - Check available time slots
4. `POST /api/ai/appointments` - Create the appointment
5. Notification sent automatically by backend

**Request Example** (Create Appointment):
```json
{
  "action": "create",
  "employeeId": "employee-uuid",
  "serviceId": "service-uuid",
  "customerName": "Jane Doe",
  "customerPhone": "+15551234567",
  "customerEmail": null,
  "appointmentDate": "2024-01-16",
  "startTime": "14:00",
  "notes": "Booked via AI assistant",
  "addonIds": []
}
```

#### Intent: Cancel Appointment

**Conversation Flow**:
```
AI: "I can help you cancel your appointment. May I have your phone number to look up your booking?"
Customer: "555-123-4567"

AI: [Looks up appointments via API]
    "I found an appointment for Jane Doe on January 16th at 2:00 PM for a women's haircut. 
     Is this the appointment you'd like to cancel?"

Customer: "Yes, that's the one"

AI: "May I ask the reason for cancellation? This helps us improve our service."
Customer: "I need to reschedule for next week"

AI: [Cancels appointment via API]
    "Your appointment has been cancelled. Would you like to book a new appointment for next week?"

Customer: "Yes, please"

AI: [Proceeds with booking flow]
```

**API Calls Made**:
1. `POST /api/ai/appointments` with `action: "get"` - Find customer appointments
2. `POST /api/ai/appointments` with `action: "cancel"` - Cancel appointment

#### Intent: Modify Appointment

**Conversation Flow**:
```
AI: "I can help you modify your appointment. What would you like to change?"
Customer: "I need to move my appointment to a different time"

AI: "What's your phone number so I can look up your appointment?"
Customer: "555-123-4567"

AI: [Retrieves appointments]
    "I see you have an appointment on January 16th at 2:00 PM. What time would work better for you?"

Customer: "Can we do 4pm instead?"

AI: [Checks availability]
    "Yes, 4:00 PM is available. I've updated your appointment to January 16th at 4:00 PM. 
     You'll receive a confirmation text shortly."
```

**API Calls Made**:
1. `POST /api/ai/appointments` with `action: "get"`
2. `POST /api/ai/availability` - Check new time slot
3. `POST /api/ai/appointments` with `action: "update"`

#### Intent: Ask Hours

**Conversation Flow**:
```
AI: "Our hours are Monday through Friday, 9 AM to 6 PM, Saturday 10 AM to 5 PM, and we're closed on Sundays. 
     Is there anything else I can help you with?"
```

**Data Source**: Tenant settings JSON
```json
{
  "aiAssistant": {
    "businessHours": {
      "monday": "9:00 AM - 6:00 PM",
      "tuesday": "9:00 AM - 6:00 PM",
      "wednesday": "9:00 AM - 6:00 PM",
      "thursday": "9:00 AM - 6:00 PM",
      "friday": "9:00 AM - 6:00 PM",
      "saturday": "10:00 AM - 5:00 PM",
      "sunday": "Closed"
    }
  }
}
```

#### Intent: Ask Pricing

**Conversation Flow**:
```
AI: "I can help you with pricing information. What service are you interested in?"
Customer: "How much is a women's haircut?"

AI: [Retrieves service pricing via API]
    "A women's haircut is $75 and takes about 60 minutes. 
     We also offer add-ons like deep conditioning for $30. 
     Would you like to book an appointment?"
```

**API Call**:
```json
// POST /api/ai/services
{
  "serviceId": "service-uuid"  // or omit for all services
}
```

#### Intent: Ask Services

**Conversation Flow**:
```
AI: "We offer a variety of services including:
     - Women's haircuts starting at $75
     - Men's haircuts at $50
     - Color services from $95 to $220
     - Blowouts at $60
     And several other services. Which one interests you?"
```

**API Call**: `POST /api/ai/services` (no filter)

### 6. Context Management

The AI maintains conversation context to provide smooth, natural interactions.

**Context Tracking**:
```json
{
  "conversationId": "conv-uuid",
  "customerId": "555-123-4567",
  "currentIntent": "book_appointment",
  "collectedInfo": {
    "service": "Women's Haircut",
    "serviceId": "service-uuid",
    "date": "2024-01-16",
    "time": "14:00",
    "employeeId": "employee-uuid",
    "customerName": null,  // Still collecting
    "customerPhone": null
  },
  "stepInFlow": 4,  // Asking for customer info
  "previousIntents": ["ask_pricing", "book_appointment"]
}
```

**Context Retention**:
- Customer information remembered during call
- Previous questions/intents tracked
- Partial booking information stored
- Conversation history for better responses

### 7. Error Handling

**Common Scenarios**:

**No Availability**:
```
AI: "I'm sorry, we don't have any available appointments at 2:00 PM tomorrow. 
     The closest available times are:
     - 1:00 PM
     - 3:30 PM
     - 4:00 PM
     Would any of these work for you?"
```

**Service Not Found**:
```
AI: "I'm not sure I understood which service you're looking for. 
     We offer haircuts, coloring, highlights, and blowouts. 
     Which of these interests you?"
```

**Employee Unavailable**:
```
AI: "Sarah isn't available at that time tomorrow. 
     Would you like to book with another stylist, or choose a different time with Sarah?"
```

**System Error**:
```
AI: "I'm experiencing a technical issue right now. 
     Please hold while I transfer you to a team member, 
     or you can call us back in a few minutes."
```

### 8. Call Completion

**Successful Booking**:
```
AI: "Perfect! I've scheduled your appointment for [Date] at [Time] with [Employee]. 
     You'll receive a confirmation text at [Phone Number]. 
     Is there anything else I can help you with today?"

Customer: "No, that's all"

AI: "Great! We look forward to seeing you. Have a wonderful day!"
```

**Call Log Updated**:
```json
{
  "callSid": "CAxxxxx",
  "endTime": "2024-01-15T14:35:00.000Z",
  "durationSeconds": 180,
  "callReason": "SETUP_APPOINTMENT",
  "notes": "Booked women's haircut for Jane Doe on 2024-01-16 at 14:00 with Sarah"
}
```

## AI Provider Integration

### OpenAI Integration

**Purpose**: Natural language understanding and response generation

**Key Methods**:
1. `detectIntent(userInput)` - Classify customer intent
2. `extractEntities(userInput, intent)` - Extract relevant information
3. `generateResponse(context, data)` - Create natural responses

**Configuration**:
```javascript
{
  model: "gpt-4",
  temperature: 0.7,
  max_tokens: 150,
  systemPrompt: `You are a helpful AI assistant for [Business Name]. 
                  Be friendly, professional, and concise. 
                  Help customers book appointments, answer questions about services and pricing.`
}
```

**Prompt Engineering**:

**System Prompt Template**:
```
You are an AI assistant for {{businessName}}, a {{businessType}}.

Your responsibilities:
1. Book, modify, and cancel appointments
2. Answer questions about services and pricing
3. Provide business hours information
4. Be friendly and professional

Business Hours:
{{businessHours}}

Available Services:
{{serviceList}}

Guidelines:
- Keep responses concise and clear
- Always confirm important details (date, time, name)
- If unsure, ask clarifying questions
- Maintain a {{tone}} tone
```

### Vapi Integration

**Purpose**: Call orchestration and voice processing

**Features**:
- Speech-to-Text (STT)
- Text-to-Speech (TTS)
- Call state management
- WebSocket communication
- Voice selection

**Assistant Configuration**:
```json
{
  "name": "Salon Booking Assistant",
  "firstMessage": "Hello! Thank you for calling Elegant Hair Salon. How can I help you today?",
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7
  },
  "voice": {
    "provider": "playht",
    "voiceId": "jennifer"
  },
  "tools": [
    {
      "name": "check_availability",
      "description": "Check available appointment slots",
      "url": "https://api.yourdomain.com/api/ai/availability"
    },
    {
      "name": "book_appointment",
      "description": "Book a new appointment",
      "url": "https://api.yourdomain.com/api/ai/appointments"
    }
  ]
}
```

**Webhook Events**:
1. `call.started` - Call initiated
2. `message.received` - Customer spoke
3. `message.sent` - AI responded
4. `function.called` - AI called a tool/API
5. `call.ended` - Call completed

## Availability Algorithm

### Time Slot Calculation

**Input Parameters**:
- Employee ID
- Service ID
- Date
- Addon IDs (optional)

**Algorithm**:
```javascript
function calculateAvailability(employeeId, serviceId, date, addonIds) {
  // 1. Get employee schedule for day of week
  const dayOfWeek = getDayOfWeek(date);
  const schedule = getEmployeeSchedule(employeeId, dayOfWeek);
  
  if (!schedule) return []; // Employee not working this day
  
  // 2. Calculate total service duration
  const service = getService(serviceId);
  const addons = getAddons(addonIds);
  const totalDuration = service.durationMinutes + sum(addons.map(a => a.durationMinutes));
  
  // 3. Get existing appointments for employee on this date
  const existingAppointments = getAppointments(employeeId, date);
  
  // 4. Generate potential time slots (e.g., every 30 minutes)
  const slots = [];
  let currentTime = schedule.startTime;
  
  while (currentTime + totalDuration <= schedule.endTime) {
    // Check if slot conflicts with existing appointment
    const hasConflict = existingAppointments.some(apt => {
      return timeRangesOverlap(
        currentTime, 
        currentTime + totalDuration,
        apt.startTime,
        apt.endTime
      );
    });
    
    if (!hasConflict) {
      slots.push({
        startTime: currentTime,
        endTime: currentTime + totalDuration
      });
    }
    
    currentTime += 30; // 30-minute increments
  }
  
  return slots;
}
```

**Example Output**:
```json
{
  "date": "2024-01-16",
  "employeeId": "employee-uuid",
  "availableSlots": [
    { "startTime": "09:00", "endTime": "10:00" },
    { "startTime": "09:30", "endTime": "10:30" },
    { "startTime": "14:00", "endTime": "15:00" },
    { "startTime": "14:30", "endTime": "15:30" },
    { "startTime": "16:00", "endTime": "17:00" }
  ]
}
```

## Conversation Patterns

### Multi-Turn Conversations

**Pattern**: Information Gathering
```
Turn 1:
Customer: "I need an appointment"
AI: "I'd be happy to help! What service would you like?"

Turn 2:
Customer: "A haircut"
AI: "Great! What date works for you?"

Turn 3:
Customer: "Tomorrow"
AI: "What time would you prefer?"

Turn 4:
Customer: "Around 2pm"
AI: [Checks availability and presents options]
```

**Pattern**: Clarification
```
Customer: "I want a cut"
AI: "Do you mean a women's haircut, men's haircut, or kids' haircut?"

Customer: "Women's"
AI: "Perfect! A women's haircut is $75 and takes about 60 minutes. 
     What date would you like to schedule?"
```

**Pattern**: Upselling
```
AI: "I've scheduled your haircut. We also offer a deep conditioning treatment for $30. 
     Would you like to add that to your appointment?"

Customer: "Sure, why not"
AI: "Great! I've added the deep conditioning treatment. 
     Your total time will be 80 minutes and the price is $105."
```

## Natural Language Processing

### Intent Detection Accuracy

**High Confidence** (>0.9):
- Clear, direct statements
- Standard phrases
- Example: "I'd like to book a haircut"

**Medium Confidence** (0.7-0.9):
- Slightly ambiguous
- Requires minor clarification
- Example: "I need an appointment"

**Low Confidence** (<0.7):
- Very ambiguous or complex
- Multiple possible intents
- Fallback to asking clarifying questions

### Handling Ambiguity

**Ambiguous Input**: "Can I come in tomorrow?"

**AI Response**: "I'd be happy to help! Are you looking to book an appointment, or checking if we're open tomorrow?"

**Ambiguous Service**: "I want color"

**AI Response**: "We offer several color services:
- Full Color ($150)
- Root Touch-Up ($95)
- Partial Highlights ($160)
- Full Highlights ($220)
Which one interests you?"

## Performance Metrics

### Key Metrics to Track

1. **Call Completion Rate**: % of calls successfully handled without transfer
2. **Intent Detection Accuracy**: % of correctly identified intents
3. **Booking Success Rate**: % of calls that result in bookings
4. **Average Call Duration**: Time from greeting to completion
5. **Customer Satisfaction**: Post-call survey scores
6. **Containment Rate**: % of calls handled without human intervention

**Target Metrics**:
- Call completion: >85%
- Intent accuracy: >90%
- Booking success: >70%
- Average duration: 2-3 minutes
- Containment: >80%

## Testing AI Conversations

### Test Scenarios

1. **Happy Path Booking**:
   - Customer books appointment with all info upfront
   - Expected: Successful booking in 1-2 minutes

2. **Incremental Information**:
   - Customer provides info piece by piece
   - Expected: AI asks appropriate follow-up questions

3. **No Availability**:
   - Requested time slot not available
   - Expected: AI offers alternatives

4. **Cancellation**:
   - Customer wants to cancel existing appointment
   - Expected: Successful cancellation with reason captured

5. **Price Inquiry Only**:
   - Customer just wants pricing info
   - Expected: Info provided, booking offered but not forced

6. **Off-Topic**:
   - Customer asks unrelated questions
   - Expected: Polite redirection or human transfer

### Sample Test Dialogs

**Test Case 1**: Basic Booking
```
AI: "Hello! How can I help you today?"
User: "I'd like to book a women's haircut for tomorrow at 2pm"
AI: [Checks availability]
    "I have 2:00 PM available with Sarah. May I have your name and phone number?"
User: "Jane Doe, 555-1234"
AI: "Perfect! I've booked your women's haircut with Sarah tomorrow at 2:00 PM..."
✓ Pass
```

**Test Case 2**: No Availability
```
User: "I need an appointment tomorrow at 2pm"
AI: [Checks availability]
    "I'm sorry, 2:00 PM isn't available tomorrow. 
     I have 1:00 PM, 3:00 PM, or 4:00 PM available. 
     Would any of these work?"
User: "3pm works"
AI: [Proceeds with booking]
✓ Pass
```

## Troubleshooting

### Common Issues

**Issue**: AI doesn't understand accent/speech
- **Cause**: STT accuracy issues
- **Solution**: Adjust Vapi voice sensitivity, use multiple STT providers

**Issue**: Wrong intent detected
- **Cause**: Ambiguous phrasing or poor prompt engineering
- **Solution**: Improve system prompts, add examples, lower confidence threshold

**Issue**: API timeout during call
- **Cause**: Slow backend response
- **Solution**: Optimize queries, add caching, implement fallback responses

**Issue**: Appointment double-booked
- **Cause**: Race condition in availability check
- **Solution**: Implement database-level constraints and locking

## Future Enhancements

### Planned Features
- [ ] Multi-language support (Spanish, French, etc.)
- [ ] Voice biometrics for customer identification
- [ ] Sentiment analysis for customer satisfaction
- [ ] Proactive reminders (AI calls to confirm appointments)
- [ ] Integration with customer history for personalization
- [ ] A/B testing for conversation flows
- [ ] Real-time supervisor monitoring and intervention
- [ ] Advanced analytics and conversation insights

### Advanced Capabilities
- [ ] Handling complex modifications (reschedule multiple people)
- [ ] Group bookings
- [ ] Waitlist management
- [ ] Product recommendations based on service
- [ ] Loyalty program integration
- [ ] Dynamic pricing based on demand
