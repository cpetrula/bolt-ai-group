# Issues Preview

This document provides a complete preview of all GitHub Issues that will be created.

## Summary

- **Total Issues**: 16
- **Epic Issues**: 13
- **Additional Tasks**: 3
- **Labels**: 9

## All Issues at a Glance

| # | Title | Type | Labels | Dependencies |
|---|-------|------|--------|--------------|
| 1 | [EPIC] Backend Infrastructure Setup | Epic | backend, enhancement, database | None (foundational) |
| 2 | [EPIC] Authentication & 2FA System | Epic | backend, auth, enhancement | Backend Infrastructure |
| 3 | [EPIC] Multi-Tenant Management | Epic | backend, enhancement, database | Backend Infrastructure, Authentication |
| 4 | [EPIC] Employee & Service Management | Epic | backend, enhancement, database | Backend Infrastructure, Multi-Tenant |
| 5 | [EPIC] Appointments & Availability System | Epic | backend, enhancement, database | Employee & Service Management |
| 6 | [EPIC] Billing & Subscriptions (Stripe) | Epic | backend, billing, enhancement | Backend Infrastructure, Multi-Tenant, Authentication |
| 7 | [EPIC] Telephony Integration (Twilio) | Epic | backend, telephony, enhancement | Backend Infrastructure, Multi-Tenant, Appointments |
| 8 | [EPIC] AI Assistant Integration | Epic | backend, ai, enhancement | Backend Infrastructure, Appointments, Telephony, Employees |
| 9 | [EPIC] Frontend Application (Vue 3) | Epic | frontend, enhancement | None (foundational) |
| 10 | [EPIC] Public Website Pages | Epic | frontend, enhancement | Frontend Application, Auth API, Billing API |
| 11 | [EPIC] Admin Dashboard Pages | Epic | frontend, enhancement | Frontend Application, All backend APIs |
| 12 | [EPIC] Reporting & Analytics | Epic | backend, frontend, enhancement | Telephony, Appointments, Frontend Dashboard |
| 13 | [EPIC] Documentation | Epic | docs, enhancement | All other epics |
| 14 | Create Branding Assets (Logo & Favicon) | Task | frontend, enhancement | Frontend Application |
| 15 | Set up Demo Salon Tenant | Task | backend, ai, telephony, enhancement | Tenant onboarding, Telephony, AI, Services seeding |
| 16 | Set up Docker Compose for Local Development | Task | backend, database, enhancement, docs | Backend Infrastructure |

## Epic Details

### 1. Backend Infrastructure Setup
**Purpose**: Foundation for all backend development
**Key Components**:
- Node.js + TypeScript project
- Express/Fastify framework
- MySQL + ORM (Prisma/TypeORM)
- Multi-tenant middleware
- Error handling & logging

**API Endpoints**: Health check

### 2. Authentication & 2FA System
**Purpose**: Secure user authentication and authorization
**Key Components**:
- User signup/login
- JWT token management
- Password reset flow
- TOTP-based 2FA

**API Endpoints**:
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/2fa/setup
- POST /api/auth/2fa/verify

### 3. Multi-Tenant Management
**Purpose**: Enable multiple businesses to use the platform
**Key Components**:
- Tenant data model
- Tenant creation & onboarding
- Data isolation mechanisms
- Tenant-specific settings

**API Endpoints**:
- GET /api/me
- GET /api/tenant/settings
- PATCH /api/tenant/settings

### 4. Employee & Service Management
**Purpose**: Manage salon staff and service offerings
**Key Components**:
- Employee CRUD with schedules
- Service CRUD with add-ons
- Employee-service relationships
- Default service seeding

**API Endpoints**:
- GET/POST/PATCH/DELETE /api/employees
- GET/PUT /api/employees/:id/schedule
- GET/POST/PATCH/DELETE /api/services

### 5. Appointments & Availability System
**Purpose**: Core booking functionality
**Key Components**:
- Appointment CRUD
- Availability calculation
- Conflict detection
- Cancellation tracking

**API Endpoints**:
- GET/POST/PATCH/DELETE /api/appointments
- GET /api/availability

### 6. Billing & Subscriptions (Stripe)
**Purpose**: Payment processing and subscription management
**Key Components**:
- Stripe integration
- Subscription plans ($295/mo, $2,832/yr)
- Checkout sessions
- Webhook handlers
- Customer portal

**API Endpoints**:
- GET /api/billing/subscription
- POST /api/billing/create-checkout-session
- POST /api/billing/portal-session
- POST /api/webhooks/stripe

### 7. Telephony Integration (Twilio)
**Purpose**: Phone call and SMS capabilities
**Key Components**:
- Phone number provisioning
- Incoming call webhooks
- SMS notifications
- Call logging

**API Endpoints**:
- POST /api/webhooks/twilio/voice
- POST /api/webhooks/twilio/sms

### 8. AI Assistant Integration
**Purpose**: Intelligent call handling and automation
**Key Components**:
- Pluggable AI provider interface
- Vapi integration
- OpenAI integration
- TTS configuration
- Intent detection

**API Endpoints**:
- POST /api/ai/availability
- POST /api/ai/appointments
- POST /api/ai/services

### 9. Frontend Application (Vue 3)
**Purpose**: User interface foundation
**Key Components**:
- Vite + Vue 3 + TypeScript
- Vue Router
- Pinia state management
- PrimeVue components
- Tailwind CSS
- API client

**Pages**: Foundation for all UI

### 10. Public Website Pages
**Purpose**: Marketing and user acquisition
**Key Components**:
- Home page with demo number
- Sign up page
- Login page (with 2FA)
- Forgot password page
- How It Works page
- FAQ page

**Pages**:
- /
- /signup
- /login
- /forgot-password
- /how-it-works
- /faq

### 11. Admin Dashboard Pages
**Purpose**: Business management interface
**Key Components**:
- Dashboard overview
- Employee management
- Service management
- Appointment calendar
- Billing management
- Reports & analytics
- Settings

**Pages**:
- /app
- /app/employees
- /app/services
- /app/appointments
- /app/billing
- /app/reports
- /app/settings

### 12. Reporting & Analytics
**Purpose**: Business insights and metrics
**Key Components**:
- Call logging
- Call reports
- Appointment analytics
- Revenue calculations
- Charts and visualizations

**API Endpoints**:
- GET /api/reports/calls
- GET /api/reports/appointments
- GET /api/reports/revenue

### 13. Documentation
**Purpose**: Developer and user documentation
**Key Components**:
- Architecture documentation
- API documentation
- Data model documentation
- AI flow documentation
- Setup guide
- Deployment guide

**Files**:
- docs/ARCHITECTURE.md
- docs/API.md
- docs/DATA_MODEL.md
- docs/AI_FLOW.md
- docs/SETUP.md
- docs/DEPLOYMENT.md

## Additional Tasks

### 14. Create Branding Assets
**Purpose**: Visual identity
**Deliverables**:
- logo.svg (company logo)
- favicon.ico (browser icon)
- Consistent color scheme

### 15. Set up Demo Salon Tenant
**Purpose**: Live demo for prospects
**Deliverables**:
- Demo tenant with data
- Working phone number
- Configured AI
- Example appointments

### 16. Set up Docker Compose
**Purpose**: Easy local development
**Deliverables**:
- docker-compose.yml
- MySQL service
- Environment configuration
- Documentation

## Labels Reference

| Label | Color | Usage |
|-------|-------|-------|
| backend | 0366d6 (blue) | Backend/API development |
| frontend | fbca04 (yellow) | UI/frontend development |
| ai | a2eeef (light blue) | AI/ML features |
| telephony | d73a4a (red) | Phone/SMS features |
| billing | 0e8a16 (green) | Payment/subscription |
| auth | c5def5 (light blue) | Authentication |
| database | bfdadc (gray-blue) | Database/schema |
| docs | d4c5f9 (purple) | Documentation |
| enhancement | 84b6eb (blue) | New features |

## Issue Template Structure

Every issue includes:

```markdown
## Description
[What this issue is about]

## Objectives / Tasks
[What needs to be accomplished]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Required Files/Directories
[File structure that needs to be created]

## Dependencies
[What must be completed first]

## API Endpoints (if applicable)
[Endpoints that will be created]
```

## Recommended Work Order

1. **Phase 1: Foundation**
   - Backend Infrastructure Setup
   - Frontend Application (Vue 3)
   - Documentation (initial)

2. **Phase 2: Core Auth & Tenancy**
   - Authentication & 2FA System
   - Multi-Tenant Management
   - Branding Assets

3. **Phase 3: Business Logic**
   - Employee & Service Management
   - Appointments & Availability System

4. **Phase 4: Monetization**
   - Billing & Subscriptions (Stripe)

5. **Phase 5: Communication**
   - Telephony Integration (Twilio)
   - AI Assistant Integration

6. **Phase 6: User Interface**
   - Public Website Pages
   - Admin Dashboard Pages

7. **Phase 7: Analytics & Demo**
   - Reporting & Analytics
   - Set up Demo Salon Tenant

8. **Phase 8: DevOps & Docs**
   - Docker Compose setup
   - Documentation (complete)

## Project Timeline Estimate

Based on the README.md specification:

- **MVP Timeline**: 12-16 weeks with a team of 3-4 developers
- **Backend**: 6-8 weeks
- **Frontend**: 4-6 weeks
- **Integration & Testing**: 2-3 weeks

## Success Criteria

Project is complete when:
- ✅ All 13 epics are closed
- ✅ All 3 additional tasks are done
- ✅ Demo salon is working end-to-end
- ✅ Documentation is complete
- ✅ All tests pass
- ✅ Application is deployed to production

---

**Ready to start? Run `./quick-start.sh` to create all these issues!**
