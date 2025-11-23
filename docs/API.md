# API Documentation

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Most API endpoints require authentication using JWT (JSON Web Token).

### Authentication Header
```
Authorization: Bearer <your-jwt-token>
```

### Token Acquisition
Obtain a token by:
1. Signing up: `POST /api/auth/signup`
2. Logging in: `POST /api/auth/login`

### Token Expiry
Tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`).

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Pagination

List endpoints support pagination via query parameters:

```
GET /api/employees?limit=20&offset=0
```

**Parameters**:
- `limit`: Number of items per page (default: 50, max: 100)
- `offset`: Number of items to skip (default: 0)

**Response includes**:
```json
{
  "data": [...],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

---

## Authentication Endpoints

### Sign Up
Create a new user account and tenant.

**Endpoint**: `POST /api/auth/signup`

**Rate Limit**: 5 requests per 15 minutes per IP

**Request Body**:
```json
{
  "email": "owner@salon.com",
  "password": "SecurePass123"
}
```

**Validation**:
- Email must be valid format
- Password minimum 8 characters, must contain uppercase, lowercase, and number

**Success Response** (201):
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "owner@salon.com",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400` - Invalid email or weak password
- `409` - Email already exists

---

### Login
Authenticate and receive JWT token.

**Endpoint**: `POST /api/auth/login`

**Rate Limit**: 5 requests per 15 minutes per IP

**Request Body**:
```json
{
  "email": "owner@salon.com",
  "password": "SecurePass123",
  "twoFactorToken": "123456"
}
```

**Note**: `twoFactorToken` is required only if 2FA is enabled for the user.

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "owner@salon.com",
      "twoFactorEnabled": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `401` - Invalid credentials
- `403` - 2FA token required or invalid

---

### Forgot Password
Request a password reset token.

**Endpoint**: `POST /api/auth/forgot-password`

**Rate Limit**: 3 requests per hour per IP

**Request Body**:
```json
{
  "email": "owner@salon.com"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "message": "If the email exists, a reset link has been sent"
  }
}
```

**Note**: For security, the same response is returned regardless of whether the email exists.

---

### Reset Password
Reset password using the reset token.

**Endpoint**: `POST /api/auth/reset-password`

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "message": "Password reset successfully"
  }
}
```

**Error Responses**:
- `400` - Invalid or expired token
- `400` - Weak password

---

### Setup 2FA
Generate a 2FA secret and QR code.

**Endpoint**: `POST /api/auth/2fa/setup`

**Authentication**: Required

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Scan the QR code with your authenticator app",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

---

### Verify 2FA
Enable 2FA by verifying a TOTP code.

**Endpoint**: `POST /api/auth/2fa/verify`

**Authentication**: Required

**Request Body**:
```json
{
  "token": "123456"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "message": "2FA enabled successfully"
  }
}
```

**Error Response**:
- `400` - Invalid token

---

### Disable 2FA
Disable 2FA for the account.

**Endpoint**: `POST /api/auth/2fa/disable`

**Authentication**: Required

**Request Body**:
```json
{
  "token": "123456"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "message": "2FA disabled successfully"
  }
}
```

---

## Tenant Endpoints

### Get Current Tenant
Get details of the authenticated user's tenant.

**Endpoint**: `GET /api/tenant`

**Authentication**: Required

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "id": "tenant-uuid",
    "name": "Elegant Hair Salon",
    "businessType": "salon",
    "status": "ACTIVE",
    "twilioPhoneNumber": "+15551234567",
    "settings": {
      "aiAssistant": {
        "greeting": "Thank you for calling Elegant Hair Salon...",
        "businessHours": { ... }
      }
    },
    "createdAt": "2024-01-10T08:00:00.000Z"
  }
}
```

---

### Update Tenant Settings
Update tenant configuration.

**Endpoint**: `PATCH /api/tenant/settings`

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Elegant Hair Salon & Spa",
  "settings": {
    "aiAssistant": {
      "greeting": "Welcome to Elegant Hair Salon and Spa!",
      "tone": "friendly",
      "businessHours": {
        "monday": "9:00 AM - 6:00 PM",
        "tuesday": "9:00 AM - 6:00 PM",
        "wednesday": "9:00 AM - 6:00 PM",
        "thursday": "9:00 AM - 7:00 PM",
        "friday": "9:00 AM - 7:00 PM",
        "saturday": "10:00 AM - 5:00 PM",
        "sunday": "Closed"
      }
    }
  }
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Tenant settings updated successfully",
  "data": { ... }
}
```

---

## Employee Endpoints

### List Employees
Get all employees for the authenticated tenant.

**Endpoint**: `GET /api/employees`

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Results per page (default: 50, max: 100)
- `offset` (optional): Skip items (default: 0)
- `isActive` (optional): Filter by active status (true/false)

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "employees": [
      {
        "id": "employee-uuid-1",
        "tenantId": "tenant-uuid",
        "name": "Sarah Johnson",
        "role": "Senior Stylist",
        "phone": "+15551234567",
        "email": "sarah@salon.com",
        "isActive": true,
        "createdAt": "2024-01-10T08:00:00.000Z",
        "schedules": [
          {
            "dayOfWeek": 1,
            "startTime": "09:00",
            "endTime": "17:00"
          }
        ],
        "services": [
          {
            "id": "service-uuid-1",
            "name": "Women's Haircut"
          }
        ]
      }
    ],
    "total": 3,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Get Employee
Get a specific employee by ID.

**Endpoint**: `GET /api/employees/:id`

**Authentication**: Required

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "id": "employee-uuid",
    "name": "Sarah Johnson",
    "role": "Senior Stylist",
    "phone": "+15551234567",
    "email": "sarah@salon.com",
    "isActive": true,
    "schedules": [...],
    "services": [...]
  }
}
```

---

### Create Employee
Add a new employee.

**Endpoint**: `POST /api/employees`

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Mike Chen",
  "role": "Stylist",
  "phone": "+15559876543",
  "email": "mike@salon.com"
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Employee created successfully",
  "data": {
    "id": "new-employee-uuid",
    "name": "Mike Chen",
    "role": "Stylist",
    "phone": "+15559876543",
    "email": "mike@salon.com",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Update Employee
Update employee details.

**Endpoint**: `PATCH /api/employees/:id`

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Michael Chen",
  "role": "Senior Stylist",
  "isActive": true
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Employee updated successfully",
  "data": { ... }
}
```

---

### Delete Employee
Soft delete an employee (sets isActive to false).

**Endpoint**: `DELETE /api/employees/:id`

**Authentication**: Required

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Employee deleted successfully"
}
```

---

### Update Employee Schedule
Set or update an employee's weekly schedule.

**Endpoint**: `PUT /api/employees/:id/schedule`

**Authentication**: Required

**Request Body**:
```json
{
  "schedules": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00"
    },
    {
      "dayOfWeek": 2,
      "startTime": "09:00",
      "endTime": "17:00"
    },
    {
      "dayOfWeek": 3,
      "startTime": "10:00",
      "endTime": "18:00"
    }
  ]
}
```

**Note**: `dayOfWeek` is 0-6 where 0 = Sunday, 1 = Monday, etc.

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Employee schedule updated successfully",
  "data": { ... }
}
```

---

## Service Endpoints

### List Services
Get all services for the authenticated tenant.

**Endpoint**: `GET /api/services`

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Results per page
- `offset` (optional): Skip items
- `isActive` (optional): Filter by active status

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "services": [
      {
        "id": "service-uuid-1",
        "tenantId": "tenant-uuid",
        "name": "Women's Haircut",
        "description": "Professional haircut for women",
        "basePrice": "75.00",
        "durationMinutes": 60,
        "isActive": true,
        "addons": [
          {
            "id": "addon-uuid-1",
            "name": "Deep Conditioning Treatment",
            "price": "30.00",
            "durationMinutes": 20
          }
        ],
        "createdAt": "2024-01-10T08:00:00.000Z"
      }
    ],
    "total": 8,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Get Service
Get a specific service by ID.

**Endpoint**: `GET /api/services/:id`

**Authentication**: Required

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "id": "service-uuid",
    "name": "Women's Haircut",
    "description": "Professional haircut for women",
    "basePrice": "75.00",
    "durationMinutes": 60,
    "isActive": true,
    "addons": [...]
  }
}
```

---

### Create Service
Add a new service.

**Endpoint**: `POST /api/services`

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Balayage",
  "description": "Hand-painted highlights for natural look",
  "basePrice": 180,
  "durationMinutes": 150
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Service created successfully",
  "data": { ... }
}
```

---

### Update Service
Update service details.

**Endpoint**: `PATCH /api/services/:id`

**Authentication**: Required

**Request Body**:
```json
{
  "basePrice": 195,
  "durationMinutes": 160
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Service updated successfully",
  "data": { ... }
}
```

---

### Delete Service
Soft delete a service.

**Endpoint**: `DELETE /api/services/:id`

**Authentication**: Required

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Service deleted successfully"
}
```

---

### Add Service Addon
Create an addon for a service.

**Endpoint**: `POST /api/services/:serviceId/addons`

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Olaplex Treatment",
  "price": 40,
  "durationMinutes": 20
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Service addon created successfully",
  "data": { ... }
}
```

---

## Appointment Endpoints

### List Appointments
Get all appointments for the authenticated tenant.

**Endpoint**: `GET /api/appointments`

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Results per page
- `offset` (optional): Skip items
- `status` (optional): Filter by status (SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, etc.)
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)
- `employeeId` (optional): Filter by employee

**Example**:
```
GET /api/appointments?startDate=2024-01-15&endDate=2024-01-31&status=SCHEDULED
```

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "appointments": [
      {
        "id": "appointment-uuid-1",
        "tenantId": "tenant-uuid",
        "employeeId": "employee-uuid",
        "serviceId": "service-uuid",
        "customerName": "Jane Doe",
        "customerEmail": "jane@example.com",
        "customerPhone": "+15551234567",
        "appointmentDate": "2024-01-20T00:00:00.000Z",
        "startTime": "14:00",
        "endTime": "15:00",
        "status": "SCHEDULED",
        "totalPrice": "75.00",
        "totalDuration": 60,
        "notes": "First-time customer",
        "employee": {
          "name": "Sarah Johnson"
        },
        "service": {
          "name": "Women's Haircut"
        },
        "addons": [],
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "total": 12,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Get Appointment
Get a specific appointment by ID.

**Endpoint**: `GET /api/appointments/:id`

**Authentication**: Required

**Success Response** (200):
```json
{
  "status": "success",
  "data": { ... }
}
```

---

### Create Appointment
Book a new appointment.

**Endpoint**: `POST /api/appointments`

**Authentication**: Required

**Request Body**:
```json
{
  "employeeId": "employee-uuid",
  "serviceId": "service-uuid",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "+15551234567",
  "appointmentDate": "2024-01-20",
  "startTime": "14:00",
  "notes": "First-time customer",
  "addonIds": ["addon-uuid-1"]
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Appointment created successfully",
  "data": {
    "id": "new-appointment-uuid",
    "employeeId": "employee-uuid",
    "serviceId": "service-uuid",
    "customerName": "Jane Doe",
    "appointmentDate": "2024-01-20T00:00:00.000Z",
    "startTime": "14:00",
    "endTime": "15:00",
    "status": "SCHEDULED",
    "totalPrice": "105.00",
    "totalDuration": 80
  }
}
```

**Error Responses**:
- `400` - Invalid date/time or employee/service not found
- `409` - Time slot conflict (employee not available)

---

### Update Appointment
Modify an existing appointment.

**Endpoint**: `PATCH /api/appointments/:id`

**Authentication**: Required

**Request Body**:
```json
{
  "appointmentDate": "2024-01-21",
  "startTime": "15:00",
  "status": "CONFIRMED",
  "notes": "Updated by customer request"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Appointment updated successfully",
  "data": { ... }
}
```

---

### Cancel Appointment
Cancel an appointment.

**Endpoint**: `DELETE /api/appointments/:id`

**Authentication**: Required

**Request Body** (optional):
```json
{
  "cancellationReason": "Customer requested reschedule"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Appointment cancelled successfully"
}
```

---

### Check Availability
Check available time slots for booking.

**Endpoint**: `POST /api/appointments/availability`

**Authentication**: Required

**Request Body**:
```json
{
  "employeeId": "employee-uuid",
  "serviceId": "service-uuid",
  "date": "2024-01-20",
  "addonIds": ["addon-uuid-1"]
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "date": "2024-01-20",
    "employeeId": "employee-uuid",
    "serviceId": "service-uuid",
    "totalDuration": 80,
    "availableSlots": [
      { "startTime": "09:00", "endTime": "10:20" },
      { "startTime": "10:30", "endTime": "11:50" },
      { "startTime": "14:00", "endTime": "15:20" }
    ]
  }
}
```

---

## Billing Endpoints

### Get Subscription
Get the current subscription for the authenticated tenant.

**Endpoint**: `GET /api/billing/subscription`

**Authentication**: Required

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "id": "subscription-uuid",
    "tenantId": "tenant-uuid",
    "stripeCustomerId": "cus_xxxxx",
    "stripeSubscriptionId": "sub_xxxxx",
    "status": "ACTIVE",
    "plan": "MONTHLY",
    "currentPeriodStart": "2024-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "trialEnd": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Create Checkout Session
Create a Stripe checkout session for subscription.

**Endpoint**: `POST /api/billing/create-checkout-session`

**Authentication**: Required

**Request Body**:
```json
{
  "plan": "MONTHLY",
  "successUrl": "https://yourdomain.com/success",
  "cancelUrl": "https://yourdomain.com/cancel"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "sessionId": "cs_xxxxx",
    "url": "https://checkout.stripe.com/c/pay/cs_xxxxx"
  }
}
```

---

### Create Portal Session
Create a Stripe customer portal session.

**Endpoint**: `POST /api/billing/portal-session`

**Authentication**: Required

**Request Body**:
```json
{
  "returnUrl": "https://yourdomain.com/dashboard"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "url": "https://billing.stripe.com/p/session/xxxxx"
  }
}
```

---

## Telephony Endpoints

### Get Call Logs
Get call history for the authenticated tenant.

**Endpoint**: `GET /api/telephony/call-logs`

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Results per page
- `offset` (optional): Skip items
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)
- `callReason` (optional): Filter by reason

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "callLogs": [
      {
        "id": "call-log-uuid",
        "callSid": "CAxxxxx",
        "fromNumber": "+15559876543",
        "toNumber": "+15551234567",
        "startTime": "2024-01-15T14:30:00.000Z",
        "endTime": "2024-01-15T14:35:00.000Z",
        "durationSeconds": 300,
        "callReason": "SETUP_APPOINTMENT",
        "notes": "Booked haircut appointment",
        "recordingUrl": "https://api.twilio.com/...",
        "createdAt": "2024-01-15T14:30:00.000Z"
      }
    ],
    "total": 45,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Get Notifications
Get notification history.

**Endpoint**: `GET /api/telephony/notifications`

**Authentication**: Required

**Query Parameters**:
- `limit`, `offset`: Pagination
- `type`: Filter by SMS or EMAIL
- `status`: Filter by QUEUED, SENT, FAILED

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "notification-uuid",
        "type": "SMS",
        "recipient": "+15551234567",
        "message": "Your appointment is confirmed for Jan 20 at 2:00 PM",
        "status": "SENT",
        "relatedAppointmentId": "appointment-uuid",
        "sentAt": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 120,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Send SMS
Send a custom SMS message.

**Endpoint**: `POST /api/telephony/sms`

**Authentication**: Required

**Request Body**:
```json
{
  "phoneNumber": "+15551234567",
  "message": "Thank you for your business!"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "SMS sent successfully"
}
```

---

### Send Appointment Confirmation
Send appointment confirmation SMS.

**Endpoint**: `POST /api/telephony/appointment-confirmation`

**Authentication**: Required

**Request Body**:
```json
{
  "appointmentId": "appointment-uuid"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Appointment confirmation sent successfully"
}
```

---

### Get Phone Number
Get the tenant's Twilio phone number.

**Endpoint**: `GET /api/telephony/phone-number`

**Authentication**: Required

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "phoneNumber": "+15551234567"
  }
}
```

---

## AI Assistant Endpoints

### Check Availability (AI)
AI-callable endpoint to check appointment availability.

**Endpoint**: `POST /api/ai/availability`

**Authentication**: Required (JWT from AI system)

**Request Body**:
```json
{
  "employeeId": "employee-uuid",
  "serviceId": "service-uuid",
  "date": "2024-01-20",
  "addonIds": []
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "date": "2024-01-20",
    "employeeId": "employee-uuid",
    "serviceId": "service-uuid",
    "availableSlots": [
      { "startTime": "09:00", "endTime": "10:00" },
      { "startTime": "14:00", "endTime": "15:00" }
    ]
  }
}
```

---

### Manage Appointments (AI)
AI-callable endpoint to create, update, cancel, or get appointments.

**Endpoint**: `POST /api/ai/appointments`

**Authentication**: Required

**Request Body (Create)**:
```json
{
  "action": "create",
  "employeeId": "employee-uuid",
  "serviceId": "service-uuid",
  "customerName": "John Doe",
  "customerPhone": "+15559876543",
  "customerEmail": "john@example.com",
  "appointmentDate": "2024-01-20",
  "startTime": "14:00",
  "notes": "Called via AI assistant",
  "addonIds": []
}
```

**Request Body (Cancel)**:
```json
{
  "action": "cancel",
  "appointmentId": "appointment-uuid",
  "cancellationReason": "Customer requested"
}
```

**Request Body (Get)**:
```json
{
  "action": "get",
  "customerPhone": "+15559876543",
  "futureOnly": true
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": { ... }
}
```

---

### Get Services (AI)
AI-callable endpoint to get service information.

**Endpoint**: `POST /api/ai/services`

**Authentication**: Required

**Request Body** (all services):
```json
{}
```

**Request Body** (specific service):
```json
{
  "serviceId": "service-uuid"
}
```

**Success Response** (200):
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
      "addons": [...]
    }
  ]
}
```

---

### Process Natural Language (AI)
Process natural language input and execute appropriate actions.

**Endpoint**: `POST /api/ai/process`

**Authentication**: Required

**Request Body**:
```json
{
  "userInput": "I'd like to book a haircut for tomorrow at 2pm",
  "context": {
    "customerPhone": "+15559876543",
    "customerEmail": "john@example.com",
    "customerName": "John Doe"
  }
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Great! I've booked your appointment for Jan 21 at 2:00 PM. You'll receive a confirmation shortly.",
  "data": {
    "appointment": {
      "id": "appointment-uuid",
      "appointmentDate": "2024-01-21T00:00:00.000Z",
      "startTime": "14:00"
    }
  }
}
```

---

## Reports Endpoints

### Get Call Reports
Get call analytics and statistics.

**Endpoint**: `GET /api/reports/calls`

**Authentication**: Required

**Query Parameters**:
- `startDate` (optional): ISO 8601 date
- `endDate` (optional): ISO 8601 date

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "totalCalls": 145,
    "callsByReason": {
      "SETUP_APPOINTMENT": 78,
      "CANCEL_APPOINTMENT": 12,
      "MODIFY_APPOINTMENT": 8,
      "GET_HOURS": 25,
      "GET_PRICING": 15,
      "OTHER": 7
    },
    "averageDuration": 185,
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    }
  }
}
```

---

### Get Appointment Reports
Get appointment statistics.

**Endpoint**: `GET /api/reports/appointments`

**Authentication**: Required

**Query Parameters**:
- `startDate`, `endDate`: Date range

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "totalAppointments": 98,
    "appointmentsByStatus": {
      "SCHEDULED": 45,
      "CONFIRMED": 12,
      "COMPLETED": 35,
      "CANCELLED": 6
    },
    "cancellationRate": 6.1,
    "mostPopularServices": [
      {
        "serviceName": "Women's Haircut",
        "count": 42
      }
    ]
  }
}
```

---

### Get Revenue Reports
Get revenue statistics.

**Endpoint**: `GET /api/reports/revenue`

**Authentication**: Required

**Query Parameters**:
- `startDate`, `endDate`: Date range

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "totalRevenue": "8450.00",
    "completedAppointments": 35,
    "averageAppointmentValue": "241.43",
    "revenueByService": [
      {
        "serviceName": "Women's Haircut",
        "revenue": "3150.00",
        "count": 42
      }
    ],
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    }
  }
}
```

---

## Webhook Endpoints

Webhook endpoints do not require authentication but should validate signatures.

### Stripe Webhook
Handle Stripe subscription events.

**Endpoint**: `POST /api/webhooks/stripe`

**Headers**:
- `Stripe-Signature`: Signature for verification

**Events Handled**:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Response** (200):
```json
{
  "received": true
}
```

---

### Twilio Voice Webhook
Handle incoming voice calls.

**Endpoint**: `POST /api/webhooks/twilio/voice`

**Request Body** (from Twilio):
```
CallSid=CAxxxxx
From=+15559876543
To=+15551234567
CallStatus=ringing
```

**Response**: TwiML XML
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling. Please hold while we connect you.</Say>
</Response>
```

---

### Twilio Voice Status Webhook
Handle call status updates.

**Endpoint**: `POST /api/webhooks/twilio/voice/status`

**Request Body** (from Twilio):
```
CallSid=CAxxxxx
CallStatus=completed
CallDuration=300
```

**Response** (200):
```json
{
  "received": true
}
```

---

### Twilio SMS Webhook
Handle incoming SMS messages.

**Endpoint**: `POST /api/webhooks/twilio/sms`

**Request Body** (from Twilio):
```
MessageSid=SMxxxxx
From=+15559876543
To=+15551234567
Body=Hello
```

**Response**: TwiML XML
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thank you for your message. We'll get back to you soon!</Message>
</Response>
```

---

### Vapi Webhook
Handle Vapi call events.

**Endpoint**: `POST /api/ai/webhooks/vapi`

**Request Body**: Vapi event payload

**Response** (200):
```json
{
  "received": true
}
```

---

## Health Check

### Health Check
Check API and database health.

**Endpoint**: `GET /api/health`

**Authentication**: Not required

**Success Response** (200):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 86400,
  "database": "connected"
}
```

---

## Rate Limits

All endpoints are subject to rate limiting:

- **Authentication endpoints**: 5-10 requests per 15 minutes per IP
- **General API endpoints**: 100 requests per 15 minutes per user
- **Webhook endpoints**: No rate limit

Rate limit headers included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1610000000
```

When rate limit is exceeded, API returns `429 Too Many Requests`.

---

## Error Handling

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication token |
| 403 | `FORBIDDEN` | Insufficient permissions or 2FA required |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict (e.g., time slot taken) |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

### Error Response Example
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## SDK & Client Libraries

### JavaScript/TypeScript
Use Axios or Fetch API with the base URL and authentication headers.

**Example**:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.yourdomain.com/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get employees
const response = await api.get('/employees');
console.log(response.data);
```

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Authentication with JWT and 2FA
- Employee, service, and appointment management
- Billing integration with Stripe
- Telephony integration with Twilio
- AI assistant endpoints
- Reports and analytics
