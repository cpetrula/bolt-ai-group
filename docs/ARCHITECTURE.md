# System Architecture

## Overview

Bolt AI Group is a multi-tenant SaaS platform that provides AI-powered virtual assistants for businesses, starting with hair salons. The system enables businesses to automate phone calls for appointment booking, cancellations, modifications, and answering common questions using conversational AI.

## Architectural Principles

### Multi-Tenancy
- **Tenant Isolation**: Each business (tenant) has completely isolated data
- **Shared Infrastructure**: All tenants share the same application infrastructure
- **Tenant-Scoped Operations**: All database queries and operations are filtered by `tenantId`
- **Security**: Multi-tenant middleware ensures users can only access their own tenant's data

### Scalability
- **Stateless API**: Backend API is stateless, enabling horizontal scaling
- **Database Connection Pooling**: Prisma ORM manages database connections efficiently
- **Async Processing**: Background jobs handle time-consuming tasks (SMS, emails, AI processing)

### Modularity
- **Domain-Driven Modules**: Each business domain is encapsulated in its own module
- **Clean Interfaces**: Modules communicate through well-defined interfaces
- **Pluggable AI Providers**: AI integration uses provider pattern for easy swapping

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Vue 3 SPA (Frontend)                                           │
│  - Vue Router (Routing)                                         │
│  - Pinia (State Management)                                     │
│  - PrimeVue (UI Components)                                     │
│  - Tailwind CSS (Styling)                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  Express.js Server                                              │
│  - CORS & Security (Helmet)                                     │
│  - Rate Limiting                                                │
│  - JWT Authentication                                           │
│  - Multi-Tenant Middleware                                      │
│  - Request Logging                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  Business Modules:                                              │
│  ┌──────────────┬──────────────┬──────────────┬─────────────┐  │
│  │ Auth         │ Tenants      │ Employees    │ Services    │  │
│  └──────────────┴──────────────┴──────────────┴─────────────┘  │
│  ┌──────────────┬──────────────┬──────────────┬─────────────┐  │
│  │ Appointments │ Billing      │ Telephony    │ AI Assistant│  │
│  └──────────────┴──────────────┴──────────────┴─────────────┘  │
│  ┌──────────────┐                                               │
│  │ Reports      │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  Prisma ORM                                                     │
│  - Schema Management                                            │
│  - Query Builder                                                │
│  - Connection Pooling                                           │
│  - Migrations                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Persistence Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  MySQL Database                                                 │
│  - Tenant Data (Multi-tenant tables)                            │
│  - User Accounts & Authentication                               │
│  - Appointments & Services                                      │
│  - Call Logs & Notifications                                    │
└─────────────────────────────────────────────────────────────────┘

                    External Services
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Twilio     │  │   Stripe     │  │   OpenAI     │
│  (Telephony) │  │  (Billing)   │  │   (AI/LLM)   │
└──────────────┘  └──────────────┘  └──────────────┘
       │                 │                  │
       └─────────────────┴──────────────────┘
                         │
                         ▼
              Webhooks & API Calls
```

## Technology Stack

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Routing**: Vue Router 4
- **State Management**: Pinia
- **UI Components**: PrimeVue
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios (via services)

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: JavaScript (ES6+)
- **ORM**: Prisma
- **Database**: MySQL 8.0+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **2FA**: speakeasy (TOTP)

### External Services
- **Telephony**: Twilio (Voice & SMS)
- **Billing**: Stripe (Subscriptions & Payments)
- **AI/LLM**: OpenAI (GPT-4)
- **Call Orchestration**: Vapi (optional)
- **TTS**: ElevenLabs or OpenAI TTS (optional)

## Module Architecture

### 1. Authentication Module (`backend/src/modules/auth/`)
**Purpose**: User authentication, authorization, and 2FA

**Components**:
- `auth.controller.js`: HTTP request handlers
- `auth.service.js`: Business logic for authentication
- `auth.routes.js`: Route definitions
- `auth.validator.js`: Request validation

**Key Features**:
- JWT-based sessions
- Password hashing with bcrypt
- TOTP-based 2FA
- Password reset flow
- Rate limiting

### 2. Tenants Module (`backend/src/modules/tenants/`)
**Purpose**: Tenant (business) management

**Components**:
- Tenant CRUD operations
- Tenant settings management
- Business configuration

**Key Features**:
- Multi-tenant data isolation
- Tenant-specific settings (JSON field)
- Status management (ACTIVE, INACTIVE, SUSPENDED, TRIAL)

### 3. Employees Module (`backend/src/modules/employees/`)
**Purpose**: Employee management and scheduling

**Components**:
- Employee CRUD operations
- Schedule management
- Service assignment

**Key Features**:
- Employee profiles
- Weekly schedules (day, start/end time)
- Service capabilities mapping
- Active/inactive status

### 4. Services Module (`backend/src/modules/services/`)
**Purpose**: Service catalog and pricing

**Components**:
- Service CRUD operations
- Add-on management
- Pricing configuration

**Key Features**:
- Base services with pricing
- Service add-ons (optional extras)
- Duration tracking
- Pre-configured salon services

### 5. Appointments Module (`backend/src/modules/appointments/`)
**Purpose**: Appointment booking and management

**Components**:
- Appointment CRUD operations
- Availability calculation
- Conflict detection

**Key Features**:
- Multi-status tracking (SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)
- Availability checking
- Conflict prevention
- Add-on support
- Price calculation

### 6. Billing Module (`backend/src/modules/billing/`)
**Purpose**: Subscription and payment management

**Components**:
- Stripe integration
- Subscription lifecycle
- Webhook handlers

**Key Features**:
- Subscription plans (Monthly: $295, Yearly: $2,832)
- Checkout flow
- Customer portal
- Webhook event processing
- Trial period support

### 7. Telephony Module (`backend/src/modules/telephony/`)
**Purpose**: Phone call and SMS handling

**Components**:
- Twilio integration
- Call routing
- SMS notifications
- Call logging

**Key Features**:
- Automatic phone number provisioning
- Inbound call webhooks
- SMS sending/receiving
- Call logs with metadata
- Notification tracking

### 8. AI Assistant Module (`backend/src/modules/ai-assistant/`)
**Purpose**: Conversational AI for call handling

**Components**:
- OpenAI integration
- Vapi integration
- Intent detection
- Intent handlers

**Key Features**:
- Natural language understanding
- Intent classification (book, cancel, modify, ask_hours, etc.)
- Entity extraction
- Pluggable provider architecture
- AI-callable API endpoints

### 9. Reports Module (`backend/src/modules/reports/`)
**Purpose**: Analytics and reporting

**Components**:
- Call analytics
- Appointment statistics
- Revenue reporting

**Key Features**:
- Call summaries by reason
- Appointment metrics
- Revenue calculations
- Date range filtering

## Data Flow

### Authentication Flow
```
1. User submits credentials → Auth Controller
2. Controller validates input → Auth Service
3. Service checks credentials → Database
4. Service generates JWT token
5. Token returned to client
6. Client stores token (localStorage/sessionStorage)
7. Client includes token in Authorization header for subsequent requests
8. Auth Middleware validates token on protected routes
```

### Appointment Booking Flow (AI-Driven)
```
1. Customer calls Twilio number
2. Twilio webhook → Telephony Controller
3. Call logged → Database
4. Call forwarded → AI Assistant (Vapi/OpenAI)
5. AI processes speech → Text
6. AI detects intent → "book_appointment"
7. AI extracts entities → (service, date, time)
8. AI calls → /api/ai/availability
9. Backend calculates availability
10. AI receives available slots
11. AI calls → /api/ai/appointments (create)
12. Backend creates appointment → Database
13. Backend sends SMS confirmation → Twilio
14. Backend sends notification to employee
15. AI confirms to customer
```

### Subscription Flow
```
1. User signs up → Auth creates user
2. User redirected → Billing checkout
3. Stripe checkout session created
4. User completes payment on Stripe
5. Stripe webhook → checkout.session.completed
6. Backend creates subscription → Database
7. Backend updates tenant status → ACTIVE
8. Backend provisions Twilio number
9. Backend seeds default services
10. User redirected to dashboard
```

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless session management
- **Token Expiry**: 7 days default (configurable)
- **Password Security**: bcrypt with 12 salt rounds
- **2FA**: TOTP with 30-second codes

### Multi-Tenant Security
- **Middleware Enforcement**: All protected routes require tenant context
- **Query Filtering**: All database queries filtered by `tenantId`
- **API Isolation**: Users can only access their tenant's data
- **JWT Claims**: Token includes `userId` and `email` (tenant derived from user)

### Rate Limiting
- **Login/Signup**: 5 attempts per 15 minutes per IP
- **Password Reset**: 3 attempts per hour per IP
- **2FA Operations**: 10 attempts per 15 minutes per IP
- **General API**: Configurable per endpoint

### Data Protection
- **HTTPS Only**: All production traffic over HTTPS
- **CORS**: Configured for specific origins in production
- **Helmet.js**: Security headers (CSP, HSTS, etc.)
- **Input Validation**: express-validator on all endpoints
- **SQL Injection Protection**: Prisma ORM with parameterized queries

### Webhook Security
- **Stripe**: Signature verification using webhook secret
- **Twilio**: Signature validation (optional, implemented)

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: No session state on server
- **Database Connection Pooling**: Prisma manages connections
- **Load Balancer Ready**: No sticky sessions required

### Performance Optimization
- **Database Indexing**: Key fields indexed (tenantId, appointmentDate, etc.)
- **Pagination**: All list endpoints support pagination
- **Selective Field Returns**: Only necessary data returned
- **Caching**: Future enhancement for tenant settings

### Future Scaling Enhancements
- [ ] Redis for session caching
- [ ] Background job queue (BullMQ)
- [ ] CDN for static assets
- [ ] Database read replicas
- [ ] Microservices architecture for high-volume modules

## Deployment Architecture

### Development
```
┌──────────────────────────────────────┐
│  Developer Machine                   │
│  - Frontend: npm run dev (Vite)     │
│  - Backend: npm run dev (nodemon)   │
│  - Database: MySQL (local/Docker)   │
└──────────────────────────────────────┘
```

### Production (Recommended)
```
┌────────────────────────────────────────────────────────────┐
│  Cloud Platform (AWS/DigitalOcean/Heroku/Railway)         │
│                                                            │
│  ┌──────────────────┐      ┌──────────────────┐          │
│  │  Frontend        │      │  Backend         │          │
│  │  (Static CDN)    │      │  (Node.js)       │          │
│  │  - Vercel/       │      │  - PM2/Docker    │          │
│  │    Netlify       │      │  - Auto-restart  │          │
│  └──────────────────┘      └──────────────────┘          │
│                                     │                     │
│                            ┌────────▼────────┐            │
│                            │  MySQL Database │            │
│                            │  (Managed/RDS)  │            │
│                            └─────────────────┘            │
└────────────────────────────────────────────────────────────┘
```

## Error Handling

### Error Response Format
All API errors follow a consistent format:
```json
{
  "status": "error",
  "message": "Human-readable error message"
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Resource created
- **400**: Bad request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions, 2FA required)
- **404**: Not found
- **409**: Conflict (duplicate resource)
- **429**: Too many requests (rate limit)
- **500**: Internal server error

### Error Logging
- **Winston Logger**: Structured logging
- **Log Levels**: error, warn, info, debug
- **Error Context**: Includes stack traces, request details
- **Log Rotation**: Daily rotation in production

## Configuration Management

### Environment Variables
Configuration is managed through `.env` files:

**Backend** (`.env`):
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: Token expiration time
- `TWILIO_*`: Twilio credentials
- `STRIPE_*`: Stripe API keys
- `OPENAI_API_KEY`: OpenAI API key
- `VAPI_*`: Vapi credentials (optional)

**Frontend** (`.env`):
- `VITE_API_URL`: Backend API URL

### Per-Tenant Configuration
Tenant-specific settings stored in `tenants.settings` JSON field:
```json
{
  "aiAssistant": {
    "greeting": "Thank you for calling...",
    "tone": "professional",
    "businessHours": { ... }
  },
  "notifications": {
    "smsEnabled": true,
    "emailEnabled": true
  }
}
```

## Monitoring & Observability

### Logging
- **Request Logging**: All API requests logged
- **Error Logging**: All errors with stack traces
- **Call Logging**: All phone calls tracked in database
- **Notification Logging**: All SMS/emails tracked

### Health Checks
- **Endpoint**: `GET /api/health`
- **Response**: Database connection status, uptime
- **Usage**: Load balancer health checks

### Future Enhancements
- [ ] Application Performance Monitoring (APM)
- [ ] Real-time error tracking (Sentry)
- [ ] Metrics dashboard (Grafana)
- [ ] Alerting system
- [ ] Audit logs for all data changes

## Design Patterns

### Repository Pattern
Each module encapsulates data access logic, providing a clean interface for database operations.

### Service Layer Pattern
Business logic separated from controllers, enabling reusability and testing.

### Provider Pattern
AI integrations use provider interfaces, allowing easy swapping of implementations.

### Middleware Pattern
Cross-cutting concerns (auth, logging, multi-tenancy) implemented as Express middleware.

### Dependency Injection
Configuration and shared services injected through module imports.

## Testing Strategy

### Unit Tests
- **Controllers**: Mock service layer
- **Services**: Mock database/external APIs
- **Validators**: Test input validation rules
- **Utilities**: Test helper functions

### Integration Tests
- **API Endpoints**: Test full request/response cycle
- **Database**: Test with test database
- **External Services**: Mock or use test credentials

### End-to-End Tests
- **User Flows**: Test complete user journeys
- **AI Interactions**: Test AI conversation flows

## Best Practices

### Code Organization
- **Module-based structure**: Each domain has its own directory
- **Separation of concerns**: Controllers, services, validators separate
- **DRY principle**: Shared utilities and middleware
- **Consistent naming**: Camel case for variables, Pascal case for classes

### Database
- **Migrations**: All schema changes via Prisma migrations
- **Indexes**: All foreign keys and frequently queried fields indexed
- **Transactions**: Use for multi-step operations
- **Soft deletes**: Consider for important data (not implemented yet)

### API Design
- **RESTful endpoints**: Follow REST conventions
- **Consistent responses**: Use standard response format
- **Pagination**: All list endpoints paginated
- **Filtering**: Support query parameters for filtering
- **Versioning**: Future consideration for breaking changes

### Security
- **Least privilege**: Users only access their tenant's data
- **Input validation**: All inputs validated
- **Output sanitization**: Prevent XSS attacks
- **Secrets management**: Never commit secrets to git
- **HTTPS everywhere**: All production traffic encrypted
